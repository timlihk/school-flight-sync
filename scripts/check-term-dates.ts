import fs from 'fs/promises';
import path from 'path';
import { load } from 'cheerio';
import { mockTerms } from '@/data/mock-terms';

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
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  notes?: string;
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

if (!API_KEY) {
  console.error('Missing DEEPSEEK_API_KEY environment variable. Set it before running this script.');
  process.exit(1);
}

const normalizeName = (value: string) =>
  value.replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim().toLowerCase();

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

function inferOverrides(school: SchoolConfig, remoteTerms: RemoteTermRecord[]): TermOverrideRecord[] {
  const overrides: TermOverrideRecord[] = [];

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
      console.warn(
        `No matching term found for ${school.name} entry "${remote.termName}" (${remote.academicYear}). Skipping.`,
      );
      continue;
    }

    overrides.push({
      school: school.id,
      name: match.name,
      academicYear: match.academicYear,
      startDate: remote.startDateISO,
      endDate: remote.endDateISO,
      notes: remote.notes,
    });
  }

  return overrides;
}

async function main() {
  const aggregatedOverrides: TermOverrideRecord[] = [];

  for (const school of SCHOOLS) {
    console.log(`Fetching ${school.name} term dates...`);
    const html = await fetchPage(school.url);
    const text = extractTextContent(html);
    const prompt = buildPrompt(school, text);
    const remoteTerms = await askDeepseek(prompt);
    console.log(`  Received ${remoteTerms.length} entries from Deepseek for ${school.name}.`);

    const overrides = inferOverrides(school, remoteTerms);
    console.log(`  Matched ${overrides.length} entries to existing mock data.`);
    aggregatedOverrides.push(...overrides);
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    overrides: aggregatedOverrides,
  };

  await fs.writeFile(OVERRIDES_PATH, JSON.stringify(payload, null, 2));
  console.log(`Saved ${aggregatedOverrides.length} overrides to ${path.relative(process.cwd(), OVERRIDES_PATH)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
