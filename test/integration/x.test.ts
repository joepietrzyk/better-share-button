import { buildFirefoxDriver, CustomWebDriver } from './selenium-scripts';
import { By, until } from 'selenium-webdriver';

async function waitForXToLoad(driver: CustomWebDriver): Promise<void> {
  const bannerXBy = By.css('button[data-testid="xMigrationBottomBar"]');
  await driver.wait(until.elementLocated(bannerXBy));
  const bannerX = await driver.findElement(bannerXBy);
  await bannerX.click();
}

async function clickFirstXPost(driver: CustomWebDriver) {
  const bySharePost = By.css('button[aria-label="Share post"]');
  await driver.wait(until.elementLocated(bySharePost), 5000);
  const sharePost = await driver.findElement(bySharePost);
  //await driver.executeScript('arguments[0].scrollIntoView(true)', sharePost);
  await sharePost.isDisplayed();
  await driver.executeScript('arguments[0].click()', sharePost);
}

describe('x.com', () => {
  test('should copy a fixupx URL when the share button is clicked', async () => {
    const driver = await buildFirefoxDriver();
    await driver.get('https://x.com/elonmusk');
    await waitForXToLoad(driver);
    await clickFirstXPost(driver);
    const bsb = await driver.findElement(By.css('div[bsb-share-button="true"]'));
    await bsb.click();
    const clipboard = await driver.getClipboardText();
    expect(clipboard).toMatch(/https:\/\/fixupx\.com\/[A-Za-z0-9\-_]+\/status\/\d+/);
    await driver.close();
  });
});
