/**
 * Links a stylesheet once (idempotent). Used for CSS bundles that are emitted by the build with
 * `"inject": false` or copied as assets, so they are only loaded by the pages that need them.
 */
export function ensureStylesheet(document: Document, id: string, href: string): HTMLLinkElement {
  const existing = document.getElementById(id);
  if (existing instanceof HTMLLinkElement) {
    return existing;
  }
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
  return link;
}
