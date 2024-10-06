import 'selenium-webdriver';
import { WebElement } from 'selenium-webdriver';

declare module 'selenium-webdriver' {
  interface WebDriver {
    /**
     * Gets the URL and waits the specified amount of time for the page to load
     * @param url - the URL to get
     * @param ms - the ms to wait
     * @returns a `Promise` that resolves when the page is loaded, and the specified ms have been waited
     */
    getAndWait(url: string, ms: number = 50): Promise<void>;

    /**
     * Gets the clipboard text
     * @returns a `Promise` that resolves with the clipboard content
     */
    getClipboardText(): Promise<string>;

    /**
     * Closes out the browser for test cases, respecting `process.env.LEAVE_OPEN`
     * @returns a `Promise` that resolves when the `WebDriver` is closed
     */
    closeTest(): Promise<void>;

    /**
     * Scrolls the element into view
     * @param element the element to scroll into view
     * @returns a `Promise` that resolves when the element is in view
     */
    scrollElementIntoView(element: WebElement): Promise<void>;

    /**
     * Opens a new tab and switches to it
     * @param url - the url to navigate to
     * @returns a `Promise` that resolves with the original window handle
     */
    openNewTab(url: string = 'about:blank'): Promise<string>;
  }
}
