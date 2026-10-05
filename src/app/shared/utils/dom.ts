/** Counts all element nodes inside (and including) the given element. */
export function domNodeCount(element: Element | null | undefined): number {
  if (!element) {
    return 0;
  }
  return element.getElementsByTagName('*').length + 1;
}
