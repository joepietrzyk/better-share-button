import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { buildFirefoxDriver, changeExtensionOptionSelect } from './selenium-scripts';

async function clickShareRedditPost(driver: WebDriver) {
  await driver.wait(until.elementLocated(By.css('a.post-sharing-button')), 3000);
  const sharingButtonEl = await driver.findElement(By.css('a.post-sharing-button'));
  const sharingButton = sharingButtonEl! as WebElement;
  await sharingButton.click();

  // Wait for the sharing option to appear and click it
  const sharingOption = await driver.wait(until.elementLocated(By.css('div.bsb-post-sharing-option')), 3000);
  await sharingOption.click();

  // Perform clipboard check
  return driver.getClipboardText();
}

describe('old.reddit.com', () => {
  test('should default to vxreddit and should copy the vxreddit url to the clipboard', async () => {
    const driver = await buildFirefoxDriver();
    await driver.getAndWait('https://old.reddit.com');
    const clipboardContent = await clickShareRedditPost(driver);
    expect(clipboardContent).toMatch(/^https:\/\/vxreddit\.com\/r\/[^/]+\/comments\/[^/]+\/[^/]+\/$/);
    await driver.close();
  });

  test('should copy a rxddit URL to the clipboard when the reddit setting is rxddit', async () => {
    const driver = await buildFirefoxDriver();
    // open up extension options
    await changeExtensionOptionSelect(driver, 'reddit', 'rxddit');
    await driver.getAndWait('https://old.reddit.com');
    const clipboardContent = await clickShareRedditPost(driver);
    expect(clipboardContent).toMatch(/^https:\/\/rxddit\.com\/r\/[^/]+\/comments\/[^/]+\/[^/]+\/$/);
    await driver.close();
  });
});
