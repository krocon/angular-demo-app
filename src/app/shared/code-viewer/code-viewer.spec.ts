import { Clipboard } from '@angular/cdk/clipboard';
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Notifier } from '../../core/notify/notifier';
import { fromSources, languageOf, lineCount, snippet } from './code-snippet';
import { CodeViewer } from './code-viewer';
import { highlight } from './highlight';

describe('highlight', () => {
  it('tokenizes TypeScript keywords, strings, comments and decorators', () => {
    const tokens = highlight("// hi\n@Component\nconst x = 'a' + 42;", 'ts');
    const types = Object.fromEntries(
      tokens.filter((t) => t.type !== 'plain').map((t) => [t.text, t.type]),
    );
    expect(types).toEqual({
      '// hi': 'comment',
      '@Component': 'decorator',
      const: 'keyword',
      "'a'": 'string',
      '42': 'number',
    });
    expect(tokens.map((t) => t.text).join('')).toBe("// hi\n@Component\nconst x = 'a' + 42;");
  });

  it('tokenizes HTML control flow, tags and bindings', () => {
    const tokens = highlight('@if (x) { <input [formField]="f.name" /> }', 'html');
    expect(tokens.find((t) => t.text === '@if')?.type).toBe('decorator');
    expect(tokens.find((t) => t.text === '<input')?.type).toBe('tag');
    expect(tokens.find((t) => t.text === '[formField]')?.type).toBe('attr');
  });

  it('handles scss, json, bash and plain text', () => {
    expect(highlight('--mat-sys-primary: red;', 'scss')[0]?.type).toBe('attr');
    expect(highlight('{"a": true}', 'json').some((t) => t.type === 'keyword')).toBe(true);
    expect(highlight('npm run build # go', 'bash').some((t) => t.type === 'comment')).toBe(true);
    expect(highlight('x', 'text')).toEqual([{ type: 'plain', text: 'x' }]);
  });
});

describe('code snippets', () => {
  it('infers languages and counts lines', () => {
    expect(languageOf('a.ts')).toBe('ts');
    expect(languageOf('a.html')).toBe('html');
    expect(languageOf('a.scss')).toBe('scss');
    expect(languageOf('a.json')).toBe('json');
    expect(languageOf('a.sh')).toBe('bash');
    expect(languageOf('README')).toBe('text');
    expect(lineCount('a\nb\n')).toBe(2);
    expect(snippet('x.ts', '\nconst a = 1;  \n').code).toBe('const a = 1;\n');
  });

  it('picks files from generated sources and fails loudly for missing ones', () => {
    const sources = { 'a.ts': 'A', 'b.html': 'B' };
    expect(fromSources(sources, ['a.ts', ['b.html', 'note']])).toEqual([
      { file: 'a.ts', code: 'A', language: 'ts', note: undefined },
      { file: 'b.html', code: 'B', language: 'html', note: 'note' },
    ]);
    expect(() => fromSources(sources, ['missing.ts'])).toThrow(/missing\.ts/);
  });
});

describe('CodeViewer', () => {
  it('renders the file badge, line count and copies the code', async () => {
    const notifier = { open: vi.fn(() => Promise.resolve(false)) };
    const clipboard = { copy: vi.fn(() => true) };
    TestBed.configureTestingModule({
      providers: [
        { provide: Notifier, useValue: notifier },
        { provide: Clipboard, useValue: clipboard },
      ],
    });
    const code = signal('const a = 1;\nconst b = 2;\n');
    const fixture = TestBed.createComponent(CodeViewer, {
      bindings: [inputBinding('code', code), inputBinding('file', () => 'demo.ts')],
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.file')?.textContent).toBe('demo.ts');
    expect(el.querySelector('.lines')?.textContent).toBe('2 lines');
    expect(el.querySelectorAll('.keyword')).toHaveLength(2);
    el.querySelector('button')!.click();
    expect(clipboard.copy).toHaveBeenCalledWith(code());
    expect(notifier.open).toHaveBeenCalledWith('Copied', undefined, 1500);
  });
});
