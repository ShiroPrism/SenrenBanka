import { isAllowedUrl } from './schema.mjs';

const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;

export async function fetchBuffer(
  url,
  {
    fetchImpl = globalThis.fetch,
    maxBytes = DEFAULT_MAX_BYTES,
    timeoutMs = 120_000,
    label = 'download',
  } = {},
) {
  if (!isAllowedUrl(url)) {
    throw new Error(`${label} URL must use HTTPS (loopback HTTP is allowed only in tests): ${url}`);
  }
  if (typeof fetchImpl !== 'function')
    throw new Error('this Node.js runtime has no fetch implementation');

  let response;
  try {
    response = await fetchImpl(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'SenrenBanka-fonts/1' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new Error(
      `${label} failed: ${error.message}. Check network access or run npm run fonts:prepare with a reachable release mirror.`,
      { cause: error },
    );
  }
  if (!response.ok) {
    throw new Error(`${label} failed with HTTP ${response.status}: ${url}`);
  }
  if (!isAllowedUrl(response.url || url)) {
    throw new Error(`${label} redirected to a disallowed URL: ${response.url}`);
  }

  const declaredSize = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
    throw new Error(`${label} is too large: ${declaredSize} bytes`);
  }
  if (!response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) throw new Error(`${label} is too large: ${buffer.length} bytes`);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxBytes) {
        throw new Error(`${label} is too large: exceeds ${maxBytes} bytes`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}
