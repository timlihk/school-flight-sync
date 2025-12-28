import fs from 'fs/promises';
import path from 'path';
import { load } from 'cheerio';
import { mockTerms } from '@/data/mock-terms';
import type { Term } from '@/types/school';

type SchoolId = 'benenden' | 'wycombe';

interface SchoolConfig {
  id: SchoolId;
  name: string;
  url: string;
}

interface RemoteTermRecord {
  termName: string;
  academicYear: string;
  startDateISO: string;
  endDateISO: string;
  notes?: string;
}

interface TermOverrideRecord {
  school: SchoolId;
  id?: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  type?: Term['type'];
  notes?: string;
  isNew?: boolean;
}

interface OverridesFile {
  updatedAt: string | null;
  overrides: TermOverrideRecord[];
}

const SCHOOLS: SchoolConfig[] = [
  {
    id: 'benenden',
    name: 'Benenden School',
    url: 'https://www.benenden.school/news/term-dates/',
  },
  {
    id: 'wycombe',
    name: 'Wycombe Abbey',
    url: 'https://www.wycombeabbey.com/term-dates/',
  },
];

const API_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36';
const OVERRIDES_PATH = path.resolve(process.cwd(), 'src/data/term-overrides.json');

const normalizeName = (value: string) =>
  value.replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim().toLowerCase();

const deriveAcademicYear = (startISO: string, provided?: string): string => {
  if (provided && provided.includes('-')) return provided;
  const date = new Date(startISO);
  const startYear = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
};

const inferTermType = (name: string): Term['type'] => {
  const lower = name.toLowerCase();
  if (lower.includes('half')) return 'half-term';
  if (lower.includes('exeat')) return 'exeat';
  if (lower.includes('holiday')) return 'holiday';
  if (lower.includes('short leave')) return 'short-leave';
  if (lower.includes('long leave')) return 'long-leave';
  return 'term';
};

const generateTermId = (school: SchoolId, termName: string, academicYear: string): string => {
  const slug = normalizeName(termName).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const yearFragment = academicYear.replace(/[^0-9]+/g, '');
  return `${school}-${slug}-${yearFragment}`.toLowerCase();
};

const overrideKey = (record: TermOverrideRecord) =>
  record.id ?? `${record.school}|${normalizeName(record.name)}|${record.academicYear}`;

if (!API_KEY) {
  console.error('Missing DEEPSEEK_API_KEY environment variable. Set it before running this script.');
  process.exit(1);
}

async function readExistingOverrides(): Promise<OverridesFile> {
  try {
    const content = await fs.readFile(OVERRIDES_PATH, 'utf-8');
    return JSON.parse(content) as OverridesFile;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { updatedAt: null, overrides: [] };
    }
    throw error;
  }
}

const existingTerms = mockTerms.map((term) => ({
  school: term.school as SchoolId,
  name: term.name,
  nameNormalized: normalizeName(term.name),
  academicYear: term.academicYear,
  startDate: term.startDate,
  endDate: term.endDate,
}));

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function extractTextContent(html: string): string {
  const $ = load(html);
  $('script, style, noscript').remove();
  const text = $('body').text().replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
  return text.slice(0, 60000);
}

async function askDeepseek(prompt: string): Promise<RemoteTermRecord[]> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You extract structured academic term dates from HTML. Always respond with raw JSON. Dates must be ISO format (YYYY-MM-DD). academicYear should be like "2026-2027".',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepseek API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const payload = await response.json();
  const content: string = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Deepseek returned an empty response.');
  }

  const jsonTextMatch = content.match(/```json([\s\S]*?)```/i);
  const jsonText = jsonTextMatch ? jsonTextMatch[1].trim() : content.trim();

  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error('Deepseek response was not a JSON array.');
  }

  return parsed as RemoteTermRecord[];
}

function buildPrompt(school: SchoolConfig, text: string): string {
  return [
    `The following text is from ${school.name}'s official term dates page.`,
    'Extract every term, half-term, holiday, and exeat with clear start and end dates.',
    'Return a JSON array where each object has the following shape:',
    '{ "termName": "Autumn Term", "academicYear": "2026-2027", "startDateISO": "2026-09-02", "endDateISO": "2026-12-10", "notes": "optional notes" }',
    'Use academicYear to capture the academic cycle (e.g. 2026-2027).',
    'Only include future or current academic years.',
    'Here is the cleaned page text:',
    text,
  ].join('\n\n');
}

function inferOverrides(school: SchoolConfig, remoteTerms: RemoteTermRecord[]): {
  overrides: TermOverrideRecord[];
  matchedCount: number;
  newCount: number;
} {
  const overrides: TermOverrideRecord[] = [];
  let matchedCount = 0;
  let newCount = 0;

  for (const remote of remoteTerms) {
    const normalizedName = normalizeName(remote.termName);
    const candidates = existingTerms.filter(
      (term) =>
        term.school === school.id &&
        normalizeName(term.name) === normalizedName &&
        (!remote.academicYear || term.academicYear === remote.academicYear),
    );

    let match = candidates.length === 1 ? candidates[0] : undefined;

    if (!match && remote.academicYear) {
      const startYear = new Date(remote.startDateISO).getFullYear();
      const filtered = candidates.filter((term) => term.startDate.getFullYear() === startYear);
      if (filtered.length === 1) {
        match = filtered[0];
      }
    }

    if (!match) {
      const academicYear = deriveAcademicYear(remote.startDateISO, remote.academicYear);
      const generatedId = generateTermId(school.id, remote.termName, academicYear);
      overrides.push({
        school: school.id,
        id: generatedId,
        name: remote.termName.trim(),
        academicYear,
        startDate: remote.startDateISO,
        endDate: remote.endDateISO,
        type: inferTermType(remote.termName),
        notes: remote.notes,
        isNew: true,
      });
      newCount += 1;
      console.warn(
        `  • Added new entry for ${school.name}: "${remote.termName}" (${academicYear}) ${remote.startDateISO} → ${remote.endDateISO}`,
      );
      continue;
    }

    overrides.push({
      school: school.id,
      id: match.id,
      name: match.name,
      academicYear: match.academicYear,
      startDate: remote.startDateISO,
      endDate: remote.endDateISO,
      type: match.type,
      notes: remote.notes,
    });
    matchedCount += 1;
  }

  return { overrides, matchedCount, newCount };
}

async function main() {
  const { overrides: existingOverrides } = await readExistingOverrides();
  const overrideMap = new Map<string, TermOverrideRecord>();
  existingOverrides.forEach((record) => {
    overrideMap.set(overrideKey(record), record);
  });

  let totalMatched = 0;
  let totalNew = 0;

  for (const school of SCHOOLS) {
    console.log(`Fetching ${school.name} term dates...`);
    const html = await fetchPage(school.url);
    const text = extractTextContent(html);
    const prompt = buildPrompt(school, text);
    const remoteTerms = await askDeepseek(prompt);
    console.log(`  Received ${remoteTerms.length} entries from Deepseek for ${school.name}.`);

    const { overrides, matchedCount, newCount } = inferOverrides(school, remoteTerms);
    totalMatched += matchedCount;
    totalNew += newCount;

    for (const record of overrides) {
      overrideMap.set(overrideKey(record), record);
    }

    console.log(`  Matched ${matchedCount} entries and recorded ${newCount} new entries.`);
  }

  const finalOverrides = Array.from(overrideMap.values()).sort((a, b) => {
    if (a.school !== b.school) return a.school.localeCompare(b.school);
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateA - dateB;
  });

  const payload = {
    updatedAt: new Date().toISOString(),
    overrides: finalOverrides,
  };

  await fs.writeFile(OVERRIDES_PATH, JSON.stringify(payload, null, 2));
  console.log(
    `Saved ${finalOverrides.length} overrides (${totalMatched} updated, ${totalNew} new) to ${path.relative(
      process.cwd(),
      OVERRIDES_PATH,
    )}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
