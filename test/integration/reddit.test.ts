import { By, until, WebDriver } from 'selenium-webdriver';
import { Select } from 'selenium-webdriver/lib/select';
import { buildFirefoxDriver } from './selenium-scripts';

async function clickShareRedditPost(driver: WebDriver) {
  // Wait for the sharing button to appear and click it
  const sharingButton = await driver.wait(until.elementLocated(By.css('a.post-sharing-button')), 10000);
  await sharingButton.click();

  // Wait for the sharing option to appear and click it
  const sharingOption = await driver.wait(until.elementLocated(By.css('div.bsb-post-sharing-option')), 10000);
  await sharingOption.click();

  // Perform clipboard check
  return await driver.executeScript(() => {
    return navigator.clipboard
      .readText()
      .then(text => text)
      .catch(err => console.log('Error reading cliipboard:', err));
  });
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
    const redditDropdown = await driver.findElement(By.id('reddit'));
    await driver.wait(until.elementIsVisible(redditDropdown), 5000);
    await redditDropdown.click();
    const redditSelect = new Select(redditDropdown);
    await redditSelect.selectByVisibleText('rxddit');
    // close the extension window and navigate to old.reddit.com
    await driver.close();
    await driver.switchTo().window(originalWindow);
    await driver.getAndWait('https://old.reddit.com');
    const clipboardContent = await clickShareRedditPost(driver);
    expect(clipboardContent).toMatch(/^https:\/\/rxddit\.com\/r\/[^/]+\/comments\/[^/]+\/[^/]+\/$/);
    await driver.close();
  });
});
