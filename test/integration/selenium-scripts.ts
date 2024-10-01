import { Options, ServiceBuilder } from 'selenium-webdriver/firefox';
import { Builder, WebDriver } from 'selenium-webdriver';
import { glob } from 'glob';

export interface CustomWebDriver extends WebDriver {
  getAndWait(url: string): Promise<void>;
  getClipboardText(): Promise<string>;
}

declare module 'selenium-webdriver' {
  interface WebDriver {
    getAndWait(url: string): Promise<void>;
    getClipboardText(): Promise<string>;
  }
}

WebDriver.prototype.getAndWait = async function (url: string, ms = 50): Promise<void> {
  await this.get(url);
  // await this.wait(async () => {
  //   await this.executeScript(
  //     `
  //     return new Promise((resolve) => {
  //       document.addEventListener('bsb-preferences-loaded', () => {
  //         resolve();
  //       });
  //     });`,
  //     100
  //   );
  //});
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

const extensionPath = glob.sync(process.env.EXTENSION_PATH_GLOB)[0];

/**
 * Builds and configures the Firefox WebDriver
 * @returns a Promise that resolves with the configured Firefox WebDriver
 */
export function buildFirefoxDriver(): Promise<CustomWebDriver> {
  const options = new Options();
  options.setPreference('xpinstall.signatures.required', false);
  options.setPreference('xpinstall.whitelist.required', false);
  options.setBinary(process.env.FIREFOX_BINARY_PATH);
  options.addExtensions(extensionPath);
  options.addArguments('--headless');
  const serviceBuilder = new ServiceBuilder(process.env.GECKODRIVER_BINARY_PATH);

  return new Builder().forBrowser('firefox').setFirefoxOptions(options).setFirefoxService(serviceBuilder).build();
}
