import { Options, ServiceBuilder } from 'selenium-webdriver/firefox';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { glob } from 'glob';
import { Select } from 'selenium-webdriver/lib/select';

const extensionPath = glob.sync(process.env.EXTENSION_PATH_GLOB)[0];

/**
 * Builds and configures the Firefox WebDriver
 * @returns a Promise that resolves with the configured Firefox WebDriver
 */
export function buildFirefoxDriver(): Promise<WebDriver> {
  const options = new Options();
  options.setPreference('xpinstall.signatures.required', false);
  options.setPreference('xpinstall.whitelist.required', false);
  options.addArguments(
    '-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );
  options.setPreference('dom.webdriver.enabled', false);
  options.setPreference('useAutomationExtension', false);
  options.setBinary(process.env.FIREFOX_BINARY_PATH);
  options.addExtensions(extensionPath);
  // @ts-ignore
  if (!process.env.NO_HEADLESS || process.env.NO_HEADLESS == false) options.addArguments('--headless');
  const serviceBuilder = new ServiceBuilder(process.env.GECKODRIVER_BINARY_PATH);

  return new Builder().forBrowser('firefox').setFirefoxOptions(options).setFirefoxService(serviceBuilder).build();
}

/**
 * Opens the `about:addons` page, opens the Extension options, and changes the specified extension option if it's a select type
 * @param driver - the WebDriver to use
 * @param optionName the name of the select option
 * @param optionValue the value to change the option to
 */
export async function changeExtensionOptionSelect(
  driver: WebDriver,
  optionName: string,
  optionValue: string
): Promise<void> {
  await driver.get('about:addons');
  const listItems = await driver.findElements(By.css('button[name="extension"]'));
  await listItems[0].click();
  await driver.executeScript(
    `let optionsPanel = document.body.querySelectorAll('panel-item[action="preferences"]')[0];
      optionsPanel.shadowRoot.querySelector('label').click();`
  );
  // switch to the options window
  await driver.wait(async () => (await driver.getAllWindowHandles()).length > 1, 10000);
  const originalWindow = await driver.getWindowHandle();
  const windows = await driver.getAllWindowHandles();
  for (const handle of windows) {
    if (handle !== originalWindow) {
      await driver.switchTo().window(handle);
      break;
    }
  }
  // switch the reddit setting to rxddit
  await driver.wait(until.elementLocated(By.id(optionName)), 5000);
  const optionDropdown = await driver.findElement(By.id(optionName));
  await driver.wait(until.elementIsVisible(optionDropdown), 5000);
  await optionDropdown.click();
  const optionSelect = new Select(optionDropdown);
  await optionSelect.selectByVisibleText(optionValue);
  // close the extension window and navigate to old.reddit.com
  await driver.close();
  await driver.switchTo().window(originalWindow);
}
