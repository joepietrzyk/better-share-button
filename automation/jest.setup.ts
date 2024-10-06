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
    arguments[0].scrollIntoView(true);
    `,
    element
  );
  await this.sleep(500);
};

WebDriver.prototype.openNewTab = async function (url: string = 'about:blank') {
  const currentWindow = await this.getWindowHandle();
  let windows = await this.getAllWindowHandles();
  await this.executeScript(`window.open('${url}', '_blank');`);
  await this.wait(async () => (await this.getAllWindowHandles()).length > windows.length, 10000);
  windows = await this.getAllWindowHandles();
  await this.switchTo().window(windows[windows.length - 1]);
  return currentWindow;
};
