import dotenv from 'dotenv';
import { until, WebDriver } from 'selenium-webdriver';

dotenv.config();
jest.setTimeout(15000);

WebDriver.prototype.getAndWait = async function (url: string, ms = 50): Promise<void> {
  await this.get(url);
  await new Promise(resolve => setTimeout(resolve, ms));
};

WebDriver.prototype.getClipboardText = function (): Promise<string> {
  return this.executeScript(() =>
    navigator.clipboard
      .readText()
      .then(text => text)
      .catch(err => console.log('Error reading clipboard:', err))
  );
};

WebDriver.prototype.closeTest = async function (): Promise<void> {
  // @ts-ignore
  if (!process.env.LEAVE_OPEN || process.env.LEAVE_OPEN == false) {
    await this.close();
  }
};

WebDriver.prototype.scrollElementIntoView = async function (element): Promise<void> {
  await this.wait(until.elementIsVisible(element), 3000);
  await this.executeScript(
    `
    const elementRect = arguments[0].getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const offset = 100; // Adjust this offset as needed to avoid sticky header
    window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: 'smooth'
    });
    `,
    element
  );
};
