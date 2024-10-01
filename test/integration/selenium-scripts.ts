import { Options, ServiceBuilder } from 'selenium-webdriver/firefox';
import { Builder, WebDriver } from 'selenium-webdriver';
import path from 'path';
import { glob } from 'glob';

const extensionGlob = path.resolve(__dirname, '../../output') + '/better_share_button-*.xpi';
const extensionPath = glob.sync(extensionGlob)[0];

/**
 * Builds and configures the Firefox WebDriver
 * @returns a Promise that resolves with the configured Firefox WebDriver
 */
export function buildFirefoxDriver(): Promise<WebDriver> {
  const options = new Options();
  options.setPreference('xpinstall.signatures.required', false);
  options.setPreference('xpinstall.whitelist.required', false);
  options.setBinary(process.env.FIREFOX_BINARY_PATH);
  options.addExtensions(extensionPath);
  options.addArguments('--headless');
  const serviceBuilder = new ServiceBuilder(process.env.GECKODRIVER_PATH);

  return new Builder().forBrowser('firefox').setFirefoxOptions(options).setFirefoxService(serviceBuilder).build();
}
