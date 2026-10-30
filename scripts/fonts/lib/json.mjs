import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function stableStringify(value, space = 2) {
  const seen = new Set();
  const normalize = (input) => {
    if (input === null || typeof input !== 'object') return input;
    if (seen.has(input)) throw new Error('cannot serialize a cyclic object');
    seen.add(input);
    let output;
    if (Array.isArray(input)) {
      output = input.map(normalize);
    } else {
      output = {};
      for (const key of Object.keys(input).sort()) output[key] = normalize(input[key]);
    }
    seen.delete(input);
    return output;
  };
  return `${JSON.stringify(normalize(value), null, space)}\n`;
}

export async function readJson(filePath, label = path.basename(filePath)) {
  let text;
  try {
    text = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`${label} cannot be read: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

export function machinePathFindings(value) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  const patterns = [
    /(?:^|[^A-Za-z0-9+.-])[A-Za-z]:[\\/]/m,
    /file:\/\//i,
    /\/Users\//,
    /\/home\/[^/\s]+\//,
    /F:\\SenrenBanka-fonts/i,
    /\.local-fonts/i,
  ];
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => String(pattern));
}

export async function writeFileAtomic(filePath, data) {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
  const temporary = path.join(
    directory,
    `.${path.basename(filePath)}.tmp-${process.pid}-${crypto.randomUUID()}`,
  );
  try {
    await fs.writeFile(temporary, data);
    await fs.rename(temporary, filePath);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}
