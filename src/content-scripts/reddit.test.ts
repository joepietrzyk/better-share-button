import {describe, expect, it, vi} from 'vitest';
import {mockWindowURL} from "../../test/helpers.test";
import {isNewOrOldReddit} from "./reddit";
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {JSDOM} from 'jsdom';

describe('isNewOrOldReddit', () => {
  it('should recognize the window URL as new.reddit.com', () => {
    mockWindowURL("https://new.reddit.com/r/funny");
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(true);
    expect(actual.isOldReddit).toBe(false);
    vi.restoreAllMocks();
  });

  it('should recognize the window URL as old.reddit.com', () => {
    mockWindowURL("https://old.reddit.com/r/funny");
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(false);
    expect(actual.isOldReddit).toBe(true);
    vi.restoreAllMocks();
  });

  it('should recognize old reddit html as old reddit', () => {
    mockWindowURL("https://reddit.com/r/funny");
    const filePath = resolve(__dirname, '__tests__/old.reddit.html');
    const htmlContent = readFileSync(filePath, 'utf-8');
    const dom = new JSDOM(htmlContent);
    global['window'] = dom.window as never;
    global['document'] = dom.window.document;
    
    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(false);
    expect(actual.isOldReddit).toBe(true);
    dom.window.close();
    vi.restoreAllMocks();
  });

  it('should recognize new reddit html as new reddit', () => {
    mockWindowURL("https://reddit.com/r/funny");
    const filePath = resolve(__dirname, '__tests__/new.reddit.html');
    const htmlContent = readFileSync(filePath, 'utf-8');
    const dom = new JSDOM(htmlContent);
    global['window'] = dom.window as never;
    global['document'] = dom.window.document;

    const actual = isNewOrOldReddit();
    expect(actual.isNewReddit).toBe(true);
    expect(actual.isOldReddit).toBe(false);
    dom.window.close();
    vi.restoreAllMocks();
  });
});
