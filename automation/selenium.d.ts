import 'selenium-webdriver';
import { WebElement } from 'selenium-webdriver';

declare module 'selenium-webdriver' {
  interface WebDriver {
    getAndWait(url: string): Promise<void>;
    getClipboardText(): Promise<string>;
    closeTest(): Promise<void>;
    scrollElementIntoView(element: WebElement): Promise<void>;
  }
}
