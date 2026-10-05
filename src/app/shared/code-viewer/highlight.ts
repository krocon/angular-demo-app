import { CodeLanguage } from './code-snippet';

export type TokenType =
  'plain' | 'comment' | 'string' | 'keyword' | 'number' | 'decorator' | 'tag' | 'attr';

export interface Token {
  readonly type: TokenType;
  readonly text: string;
}

const TS_KEYWORDS = [
  'import',
  'export',
  'from',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'of',
  'in',
  'class',
  'extends',
  'implements',
  'interface',
  'type',
  'new',
  'this',
  'readonly',
  'private',
  'public',
  'protected',
  'static',
  'async',
  'await',
  'true',
  'false',
  'null',
  'undefined',
  'as',
  'satisfies',
  'override',
  'constructor',
  'void',
  'typeof',
  'keyof',
  'try',
  'catch',
  'finally',
  'throw',
  'while',
  'switch',
  'case',
  'default',
  'break',
  'continue',
  'declare',
  'abstract',
  'enum',
];

const RULES: Record<CodeLanguage, readonly [TokenType, string][]> = {
  ts: [
    ['comment', String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`],
    ['string', String.raw`'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|\x60(?:\\.|[^\x60\\])*\x60`],
    ['decorator', String.raw`@[A-Za-z]+`],
    ['keyword', String.raw`\b(?:${TS_KEYWORDS.join('|')})\b`],
    ['number', String.raw`\b\d+(?:\.\d+)?\b`],
  ],
  html: [
    ['comment', String.raw`<!--[\s\S]*?-->`],
    [
      'decorator',
      String.raw`@(?:if|else|for|empty|switch|case|default|let|defer|placeholder|loading|error)\b`,
    ],
    ['tag', String.raw`<\/?[A-Za-z][\w-]*|\/?>`],
    ['string', String.raw`"[^"]*"|'[^']*'`],
    ['attr', String.raw`[\[(]{1,2}[\w.-]+[\])]{1,2}|\*\w+|#\w+`],
  ],
  scss: [
    ['comment', String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`],
    ['string', String.raw`'[^']*'|"[^"]*"`],
    ['decorator', String.raw`@[\w-]+`],
    ['attr', String.raw`--[\w-]+|\$[\w-]+`],
    ['number', String.raw`\b\d+(?:\.\d+)?(?:px|rem|em|ms|s|%)?\b`],
  ],
  json: [
    ['attr', String.raw`"[^"]*"(?=\s*:)`],
    ['string', String.raw`"[^"]*"`],
    ['keyword', String.raw`\b(?:true|false|null)\b`],
    ['number', String.raw`-?\b\d+(?:\.\d+)?\b`],
  ],
  bash: [
    ['comment', String.raw`#[^\n]*`],
    ['string', String.raw`'[^']*'|"[^"]*"`],
    ['keyword', String.raw`\b(?:npm|npx|ng|git|node)\b`],
    ['attr', String.raw`--?[\w-]+`],
  ],
  text: [],
};

const COMPILED = new Map<CodeLanguage, RegExp | null>();

function compile(language: CodeLanguage): RegExp | null {
  if (!COMPILED.has(language)) {
    const rules = RULES[language];
    COMPILED.set(
      language,
      rules.length ? new RegExp(rules.map(([, src]) => `(${src})`).join('|'), 'g') : null,
    );
  }
  return COMPILED.get(language) ?? null;
}

/** A tiny dependency-free tokenizer – good enough for keywords, strings and comments. */
export function highlight(code: string, language: CodeLanguage): Token[] {
  const regex = compile(language);
  if (!regex) {
    return [{ type: 'plain', text: code }];
  }
  const rules = RULES[language];
  const tokens: Token[] = [];
  let last = 0;
  regex.lastIndex = 0;
  for (let match = regex.exec(code); match; match = regex.exec(code)) {
    if (match.index > last) {
      tokens.push({ type: 'plain', text: code.slice(last, match.index) });
    }
    const groupIndex = match.findIndex((group, i) => i > 0 && group !== undefined);
    tokens.push({ type: rules[groupIndex - 1]?.[0] ?? 'plain', text: match[0] });
    last = match.index + match[0].length;
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }
  if (last < code.length) {
    tokens.push({ type: 'plain', text: code.slice(last) });
  }
  return tokens;
}
