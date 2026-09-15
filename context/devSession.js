// Dev-only helper to preview authenticated screens without a running
// backend. Never imported outside __DEV__ guards — see LoginScreen.js.
function encodeBase64Url(input) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const utf8 = unescape(encodeURIComponent(input));
  const bytes = [];

  for (let index = 0; index < utf8.length; index += 1) {
    bytes.push(utf8.charCodeAt(index));
  }

  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const byte1 = bytes[index];
    const byte2 = bytes[index + 1];
    const byte3 = bytes[index + 2];
    const triplet = (byte1 << 16) | ((byte2 ?? 0) << 8) | (byte3 ?? 0);

    output += characters[(triplet >> 18) & 63];
    output += characters[(triplet >> 12) & 63];
    output += byte2 !== undefined ? characters[(triplet >> 6) & 63] : '';
    output += byte3 !== undefined ? characters[triplet & 63] : '';
  }

  return output.replace(/\+/g, '-').replace(/\//g, '_');
}

export function createDevAccessToken({ name = 'Comandante Dev', email = 'dev@centauri.space' } = {}) {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: 'dev-bypass',
    name,
    email,
    roles: ['dev'],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  return [
    encodeBase64Url(JSON.stringify(header)),
    encodeBase64Url(JSON.stringify(payload)),
    'devsignature',
  ].join('.');
}
