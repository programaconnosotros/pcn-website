#!/usr/bin/env node
// Helper for the `agregar-conversaciones` skill. Three commands:
//
//   prepare <export.txt> <out-dir> [--since YYYY-MM-DD]
//     Parses a WhatsApp chat export, keeps the messages after the last summarized day (or
//     --since), cleans them (media placeholders, no system lines, no phone numbers) and writes
//     one compact transcript per month to <out-dir>/YYYY-MM.txt. Prints a report.
//
//   index
//     Rewrites the imports/spread in src/data/whatsapp-conversations/index.ts from the month
//     JSON files that exist.
//
//   check
//     Validates every month file and reports people named in summaries who aren't in
//     members.ts (so the participants chips and group-thread highlight keep working).
//
// Run from the repo root: node .claude/skills/agregar-conversaciones/scripts/conversations.mjs <cmd>

import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = 'src/data/whatsapp-conversations';
const INDEX_FILE = path.join(DATA_DIR, 'index.ts');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.ts');
const MONTH_FILE = /^(\d{4})-(\d{2})\.json$/;

const fail = (message) => {
  console.error(`error: ${message}`);
  process.exit(1);
};

const monthFiles = () =>
  fs
    .readdirSync(DATA_DIR)
    .filter((file) => MONTH_FILE.test(file))
    .sort();

const readMonth = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));

// Conversations from an event (`eventId`, e.g. a virtual meetup) don't come from the WhatsApp
// export, so they don't mark how far the chat has been summarized.
const lastSummarizedDate = () =>
  monthFiles()
    .flatMap(readMonth)
    .filter((entry) => !entry.eventId)
    .map((entry) => entry.date)
    .sort()
    .at(-1);

// ---------------------------------------------------------------------------------------------
// prepare

// iOS:     [06/04/2025, 18:17:06] Name: text
// Android: 06/04/2025, 18:17 - Name: text
const HEADER =
  /^\u200e?\[?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),? (\d{1,2}:\d{2})(?::\d{2})?(?:\s?[ap]\.?\s?m\.?)?\]?(?: -)? ([^:]+?): (.*)$/i;

const MEDIA = {
  image: 'imagen',
  video: 'video',
  audio: 'audio',
  sticker: 'sticker',
  GIF: 'gif',
  document: 'documento',
  'Contact card': 'contacto',
};

// Digits with spaces, dashes or parentheses (not dots, so `1.000.000` isn't one), 8+ digits.
const PHONE_LIKE = /\+?\d[\d\s()\u2011-]{6,}\d/g;
const isPhone = (text) => text.replace(/\D/g, '').length >= 8;
const maskPhones = (text) => text.replace(PHONE_LIKE, (m) => (isPhone(m) ? '[teléfono]' : m));
const hasPhone = (text) => (text.match(PHONE_LIKE) ?? []).some(isPhone);

// Invisible direction marks WhatsApp wraps names, mentions and numbers in.
const INVISIBLE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

const cleanText = (raw) => {
  let text = raw.replace(/<This message was edited>/g, '').trim();
  if (text.startsWith('\u200e') || /^<?Media omitted>?$/i.test(text)) {
    const media = text.match(
      /\u200e?(image|video|audio|sticker|GIF|document|Contact card) omitted/,
    );
    if (media) return `[${MEDIA[media[1]]}]`;
    if (/Media omitted/i.test(text)) return '[adjunto]';
    // Other lines starting with a left-to-right mark are system notices (joins, encryption...).
    if (!/omitted/.test(text)) return null;
  }
  if (/^(This message was deleted|You deleted this message|Se eliminó este mensaje)\.?$/.test(text))
    return null;
  text = text.replace(
    /\u200e?(image|video|audio|sticker|GIF|document|Contact card) omitted/g,
    (_, media) => ` [${MEDIA[media]}]`,
  );
  return maskPhones(text.replace(INVISIBLE, '')).trim() || null;
};

const cleanAuthor = (raw) => {
  const author = raw.replace(INVISIBLE, '').trim();
  // Unsaved contacts show up as a phone number: never keep it.
  if (/^\+?[\d\s()\u2011-]+$/.test(author)) return '[sin agendar]';
  // `~ Name` is the WhatsApp profile name of an unsaved contact.
  return author.replace(/^~\s*/, '~');
};

const parseExport = (file) => {
  const lines = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').split('\n');
  const headers = lines.map((line) => line.match(HEADER));
  // Day-first unless some date only makes sense month-first (e.g. 04/25/2025).
  const monthFirst = headers.some((m) => m && Number(m[2]) > 12);

  const messages = [];
  lines.forEach((line, i) => {
    const m = headers[i];
    if (!m) {
      if (messages.length && line.trim()) messages.at(-1).raw += `\n${line}`;
      return;
    }
    const [, a, b, y, time, author, raw] = m;
    const [day, month] = monthFirst ? [b, a] : [a, b];
    const year = y.length === 2 ? `20${y}` : y;
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    messages.push({ date, time: time.padStart(5, '0'), author, raw });
  });

  return messages
    .map((msg) => ({ ...msg, author: cleanAuthor(msg.author), text: cleanText(msg.raw) }))
    .filter((msg) => msg.text);
};

const prepare = (args) => {
  const [exportFile, outDir] = args.filter((arg) => !arg.startsWith('--'));
  if (!exportFile || !outDir) fail('uso: prepare <export.txt> <out-dir> [--since YYYY-MM-DD]');
  if (!fs.existsSync(exportFile)) fail(`no existe ${exportFile}`);

  const sinceFlag = args.indexOf('--since');
  const lastDate = lastSummarizedDate();
  const since = sinceFlag >= 0 ? args[sinceFlag + 1] : lastDate;

  const all = parseExport(exportFile);
  if (!all.length) fail('no se reconoció ningún mensaje: ¿es un export de WhatsApp (.txt)?');

  // `--since` is inclusive (to finish a half-summarized day); the default starts the day after
  // the last summarized one.
  const fresh = all.filter((msg) =>
    sinceFlag >= 0 ? msg.date >= since : !since || msg.date > since,
  );

  fs.mkdirSync(outDir, { recursive: true });
  const byMonth = new Map();
  for (const msg of fresh) {
    const key = msg.date.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), msg]);
  }

  console.log(`export: ${all.length} mensajes, ${all[0].date} → ${all.at(-1).date}`);
  console.log(`último día ya resumido: ${lastDate ?? '(ninguno)'}`);
  console.log(`a resumir: ${fresh.length} mensajes desde ${since ?? 'el principio'}\n`);

  for (const [key, messages] of byMonth) {
    let out = '';
    let day = '';
    for (const msg of messages) {
      if (msg.date !== day) {
        day = msg.date;
        out += `\n## ${day}\n`;
      }
      out += `${msg.time} ${msg.author}: ${msg.text}\n`;
    }
    const file = path.join(outDir, `${key}.txt`);
    fs.writeFileSync(file, out.trimStart());
    const authors = new Set(messages.map((msg) => msg.author)).size;
    const kb = Math.round(Buffer.byteLength(out) / 1024);
    console.log(`${file}  ${messages.length} mensajes, ${authors} autores, ${kb} KB`);
  }

  if (lastDate && byMonth.size) {
    const boundary = monthFiles()
      .flatMap(readMonth)
      .filter((entry) => entry.date === lastDate && !entry.eventId);
    console.log(`\nya resumido el ${lastDate} (no duplicar):`);
    for (const entry of boundary) console.log(`  - ${entry.title}`);
  }
};

// ---------------------------------------------------------------------------------------------
// index

const index = () => {
  const files = monthFiles();
  const ids = files.map((file) => `m${file.slice(0, 4)}${file.slice(5, 7)}`);
  let source = fs.readFileSync(INDEX_FILE, 'utf8');

  const importBlock = files.map((file, i) => `import ${ids[i]} from './${file}';`).join('\n');
  const spreadBlock = ids.map((id) => `  ...${id},`).join('\n');

  source = source.replace(/(import m\d{6} from '\.\/\d{4}-\d{2}\.json';\n?)+/, `${importBlock}\n`);
  source = source.replace(/(  \.\.\.m\d{6},\n)+/, `${spreadBlock}\n`);
  fs.writeFileSync(INDEX_FILE, source);
  console.log(`index.ts: ${files.length} meses registrados (${files[0]} → ${files.at(-1)})`);
};

// ---------------------------------------------------------------------------------------------
// check

const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const SPEAKER_VERBS =
  'contó|dijo|comentó|señaló|explicó|compartió|preguntó|respondió|opinó|coincidió|agregó|recomendó|sugirió|propuso|advirtió|mencionó|destacó|aportó|planteó|consultó|relató|afirmó|sostuvo|bromeó|reconoció|aclaró|celebró|anunció|confirmó|admitió|defendió|criticó|cuestionó|reportó|mostró|indicó|observó|recordó|consideró|pidió|argumentó|detalló|ofreció|contestó|remarcó|insistió|usa|prefiere|trabaja';
const WORD = '[A-ZÁÉÍÓÚÑ][a-záéíóúñü]+';
const SPEAKER = new RegExp(
  `\\b(${WORD}(?: (?:de |del |De |Di )?${WORD}){1,2}) (?:${SPEAKER_VERBS})\\b`,
  'g',
);

const check = () => {
  const problems = [];
  // Names and aliases: every quoted string that follows `name: `, `[` or `, `.
  const members = [
    ...fs.readFileSync(MEMBERS_FILE, 'utf8').matchAll(/(?:name: |\[|, )'([^']+)'/g),
  ].map((m) => normalize(m[1]));
  const indexSource = fs.readFileSync(INDEX_FILE, 'utf8');
  const seen = new Set();
  const unknown = new Map();
  let total = 0;

  for (const file of monthFiles()) {
    const month = file.slice(0, 7);
    if (!indexSource.includes(`'./${file}'`)) problems.push(`${file} no está en index.ts`);
    let entries;
    try {
      entries = readMonth(file);
    } catch (error) {
      problems.push(`${file}: JSON inválido (${error.message})`);
      continue;
    }
    if (!Array.isArray(entries)) {
      problems.push(`${file}: no es un array`);
      continue;
    }
    entries.forEach((entry, i) => {
      total++;
      const where = `${file}[${i}]`;
      const keys = Object.keys(entry).sort().join(',');
      if (keys !== 'date,summary,title' && keys !== 'date,eventId,summary,title')
        problems.push(`${where}: campos ${keys}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? '')) problems.push(`${where}: fecha inválida`);
      else if (!entry.date.startsWith(month)) problems.push(`${where}: ${entry.date} fuera de mes`);
      if (i > 0 && entry.date < entries[i - 1].date) problems.push(`${where}: fuera de orden`);
      if (!entry.title?.trim() || !entry.summary?.trim()) problems.push(`${where}: vacío`);
      if (hasPhone(entry.summary ?? '')) problems.push(`${where}: parece tener un teléfono`);
      const key = `${entry.date}|${normalize(entry.title ?? '')}`;
      if (seen.has(key)) problems.push(`${where}: duplicado "${entry.title}"`);
      seen.add(key);

      for (const [, name] of (entry.summary ?? '').matchAll(SPEAKER)) {
        if (!members.some((member) => member === normalize(name)))
          unknown.set(name, [...(unknown.get(name) ?? []), where]);
      }
    });
  }

  console.log(`${total} conversaciones en ${monthFiles().length} meses`);
  if (unknown.size) {
    console.log('\npersonas que hablan en los resúmenes y no están en members.ts:');
    for (const [name, where] of [...unknown].sort((a, b) => b[1].length - a[1].length))
      console.log(`  ${name}  (${where.length}× ej. ${where[0]})`);
    console.log('→ sumá las que sean miembros (o como alias de uno); ignorá las figuras externas.');
  }
  if (problems.length) {
    console.log(`\n${problems.length} problemas:`);
    for (const problem of problems) console.log(`  ✗ ${problem}`);
    process.exit(1);
  }
  console.log('\n✓ datos válidos');
};

// ---------------------------------------------------------------------------------------------

const [command, ...args] = process.argv.slice(2);
const commands = { prepare, index, check };
if (!commands[command])
  fail('comandos: prepare <export.txt> <out-dir> [--since YYYY-MM-DD] | index | check');
commands[command](args);
