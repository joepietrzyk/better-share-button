import { JSDOM } from 'jsdom';

/**
 * Uses JSDOM to stub the global document with the provided HTML
 * @param htmlString - a string containing the HTML of the HTML document to stub
 */
export function setHTMLStringAsDocument(htmlString: string) {
  const dom = new JSDOM(htmlString);
  vi.stubGlobal('window', dom.window);
  vi.stubGlobal('document', dom.window.document);
}

/**
 * Returns a `Promise` that resolves on the next frame
 */
export function resolveOnNextFrame(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 0);
  });
}

/**
 * stubs the clipboard with a blank function
 */
export function stubClipboard() {
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: vi.fn(),
    },
  });
}
