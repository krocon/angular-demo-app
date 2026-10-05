export type CodeLanguage = 'ts' | 'html' | 'scss' | 'json' | 'bash' | 'text';

export interface CodeSnippet {
  /** File name badge, e.g. `signal-forms-intro.page.ts`. */
  readonly file: string;
  readonly code: string;
  readonly language: CodeLanguage;
  /** Optional one-line explanation shown above the code. */
  readonly note?: string;
}

export function languageOf(fileName: string): CodeLanguage {
  const file = fileName.split(' ')[0] ?? fileName;
  if (file.endsWith('.ts') || file.endsWith('.mjs') || file.endsWith('.js')) return 'ts';
  if (file.endsWith('.html')) return 'html';
  if (file.endsWith('.scss') || file.endsWith('.css')) return 'scss';
  if (file.endsWith('.json')) return 'json';
  if (file.endsWith('.sh')) return 'bash';
  return 'text';
}

export function snippet(file: string, code: string, note?: string): CodeSnippet {
  return {
    file,
    code: code.replace(/^\n/, '').replace(/\s+$/, '') + '\n',
    language: languageOf(file),
    note,
  };
}

/**
 * Picks real source files from a generated `SOURCES` map (see scripts/generate-sources.mjs).
 * Throws when a file is missing so a renamed file breaks the build/tests instead of the UI.
 */
export function fromSources(
  sources: Readonly<Record<string, string>>,
  files: readonly (string | readonly [file: string, note: string])[],
): CodeSnippet[] {
  return files.map((entry) => {
    const [file, note] = typeof entry === 'string' ? [entry, undefined] : entry;
    const code = sources[file];
    if (code === undefined) {
      throw new Error(`Source file "${file}" not found. Run "npm run snippets".`);
    }
    return { file, code, language: languageOf(file), note };
  });
}

export function lineCount(code: string): number {
  return code.replace(/\n$/, '').split('\n').length;
}
