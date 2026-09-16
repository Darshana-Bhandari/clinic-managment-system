const SQL_KEYWORDS = /(?:\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT( +.+)? +FROM|UPDATE( +.+)? +SET|UNION( +ALL)?|TRUNCATE)\b|(--|#|\/\*|\*\/)|[\x00-\x08\x0B\x0C\x0E-\x1F])/i;

const DANGEROUS_SQL_FUNCTIONS = /(\b(LOAD_FILE|INTO +OUTFILE|BENCHMARK|SLEEP|PG_SLEEP|WAITFOR|CONVERT|CAST|CHAR\(|ASCII\(|ORD\(|MD5\(|SHA\(|SHA1\(|AES_)\s*\()/i;

const XSS_PATTERNS = [
  /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script[^>]*>/gi,
  /<\s*script[^>]*\/?\s*>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /on\w+\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+)/gi,
  /<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe[^>]*>/gi,
  /<\s*(object|embed|applet|base|link|meta|form|frameset|frame|xml|xss|svg)[^>]*>[\s\S]*?(<\s*\/\s*\1[^>]*>|\/?>)/gi,
  /<\s*img[^>]+src\s*=\s*(["'])\s*data:image\/svg[^>]*>/gi,
  /\bdata\s*:\s*text\/html\b/gi,
  /\bexpression\s*\(/gi,
  /\beval\s*\(/gi,
  /\bsetTimeout\s*\(\s*["']/gi,
  /\bsetInterval\s*\(\s*["']/gi,
];

const escapeHtml = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
};

const sanitizeStringForSQL = (value) => {
  if (typeof value !== 'string') return value;
  let cleaned = value
    .replace(/\0/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\x1a/g, '\\Z');
  return cleaned;
};

const stripXSS = (value, allowHtml = false) => {
  if (typeof value !== 'string') return value;
  let cleaned = value;
  XSS_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });
  cleaned = cleaned.replace(/<\?php[\s\S]*?\?>/gi, '');
  cleaned = cleaned.replace(/<\?[\s\S]*?\?>/gi, '');
  cleaned = cleaned.replace(/<%[\s\S]*?%>/g, '');
  if (!allowHtml) {
    cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
  }
  return cleaned.trim();
};

const containsSQLInjectionAttempt = (value) => {
  if (typeof value !== 'string') return false;
  if (SQL_KEYWORDS.test(value) && /[\s'";=()]/.test(value)) return true;
  if (DANGEROUS_SQL_FUNCTIONS.test(value)) return true;
  if (/('.*'|".*").*(=|==|<>|!=|>=|<=).*('.*'|".*")/.test(value)) return true;
  if (/\b(OR|AND)\b\s+['"\d]+\s*(=|==|<>|!=|>=|<=)\s*['"\d]+/i.test(value)) return true;
  return false;
};

const sanitizeValue = (value, opts = {}) => {
  const { allowHtml = false, maxLength = 50000 } = opts;

  if (value === null || value === undefined) return value;

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v, opts));
  }

  if (typeof value === 'object') {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      cleaned[key] = sanitizeValue(value[key], opts);
    }
    return cleaned;
  }

  if (typeof value === 'string') {
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    if (containsSQLInjectionAttempt(value)) {
      value = sanitizeStringForSQL(value);
    }
    value = stripXSS(value, allowHtml);
    return value;
  }

  return value;
};

export const sanitize = (req, _res, next) => {
  const allowHtml = req.path && (req.path.includes('/description') || req.path.includes('/notes') || req.path.includes('/message'));

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body, { allowHtml });
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params, { allowHtml: false, maxLength: 500 });
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query, { allowHtml: false, maxLength: 2000 });
  }
  if (req.headers) {
    const sanitizedHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string' && value.length < 10000) {
        sanitizedHeaders[key] = stripXSS(value, false);
      } else {
        sanitizedHeaders[key] = value;
      }
    }
    req.headers = sanitizedHeaders;
  }

  next();
};

export const escapeHtmlOutput = escapeHtml;
export const stripXSSOnly = stripXSS;
export const hasSQLInjectionAttempt = containsSQLInjectionAttempt;
export const sanitizeDeep = sanitizeValue;

export default sanitize;