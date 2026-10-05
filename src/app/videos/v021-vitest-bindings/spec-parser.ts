export interface ParsedTest {
  readonly name: string;
  readonly code: string;
}

export interface ParsedSpec {
  readonly suite: string;
  readonly tests: readonly ParsedTest[];
}

/**
 * Extracts `describe('…')` and every top-level `it('…', …)` block from a spec file's source.
 * Good enough for the well-formatted spec files of this project (Prettier output).
 */
export function parseSpec(source: string): ParsedSpec {
  const suite = /describe\('([^']+)'/.exec(source)?.[1] ?? 'spec';
  const tests: ParsedTest[] = [];
  const pattern = /^( {2})it\('([^']+)'[\s\S]*?^\1\}\);$/gm;
  for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
    const code = match[0]
      .split('\n')
      .map((line) => line.replace(/^ {2}/, ''))
      .join('\n');
    tests.push({ name: match[2] ?? '', code });
  }
  return { suite, tests };
}
