import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

const API_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY;

interface SchoolConfig {
  id: 'benenden' | 'wycombe';
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

const SCHOOLS: SchoolConfig[] = [
  { id: 'benenden', name: 'Benenden School', url: 'https://www.benenden.school/news/term-dates/' },
  { id: 'wycombe', name: 'Wycombe Abbey', url: 'https://www.wycombeabbey.com/term-dates/' },
];

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

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
  // Simple text extraction - remove script/style tags and get body text
  const withoutScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  const withoutStyles = withoutScripts.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  const withoutNoscript = withoutStyles.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  
  // Extract body content
  const bodyMatch = withoutNoscript.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : withoutNoscript;
  
  // Remove remaining HTML tags and normalize whitespace
  const text = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
  
  return text.slice(0, 60000);
}

async function askDeepseek(prompt: string): Promise<RemoteTermRecord[]> {
  if (!API_KEY) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

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

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content: string = payload?.choices?.[0]?.message?.content || '';
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

// GET /api/term-check - Run term check with DeepSeek
router.get('/', async (req, res, next) => {
  try {
    if (!API_KEY) {
      res.status(503).json({ 
        error: 'DeepSeek API not configured',
        message: 'DEEPSEEK_API_KEY environment variable is not set'
      });
      return;
    }

    console.log('🔍 Starting term date check with DeepSeek...');
    const results: Array<{
      school: string;
      terms: RemoteTermRecord[];
      error?: string;
    }> = [];

    for (const school of SCHOOLS) {
      try {
        console.log(`Fetching ${school.name}...`);
        const html = await fetchPage(school.url);
        const text = extractTextContent(html);
        const prompt = buildPrompt(school, text);
        const terms = await askDeepseek(prompt);
        
        console.log(`✓ Found ${terms.length} terms for ${school.name}`);
        results.push({ school: school.name, terms });
      } catch (error) {
        console.error(`✗ Error checking ${school.name}:`, error);
        results.push({ 
          school: school.name, 
          terms: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      deepseekConfigured: true,
      results
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/term-check/status - Check if DeepSeek is configured
router.get('/status', (req, res) => {
  res.json({
    configured: !!API_KEY,
    timestamp: new Date().toISOString(),
  });
});

export default router;
