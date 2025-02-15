import { BrowserType, Browser, BrowserContextOptions, BrowserContext, Page } from 'playwright-core';
import { IBrowserConfig, IBrowserManager, BrowserUsed, IBrowserActionState, SupportedBrowsers } from '../types'
import { checkExecutablePath } from '../utils/files';


const defaultBrowserConfig: IBrowserConfig = {
  cookiesFile: undefined,
  waitForNetworkIdlePageLoadTime: undefined,
  browserWindowSize: undefined,
  locale: undefined,
  userAgent: undefined,
  highlightElements: false,
  viewportExpansion: 0,
  allowedDomains: [],
  headless: false,
  disableSecurity: true,
  extraChromiumArgs: [],
  chromeInstancePath: null,
  wssUrl: null,
  cdpUrl: null,
  proxy: null,
  newContextConfig: {},
  _forceKeepBrowserAlive: false,
};

export class BrowserManager implements IBrowserManager {

  browser: BrowserUsed;
  state: IBrowserActionState;
  executablePath?: string;
  config: IBrowserConfig;

  constructor(browserType: SupportedBrowsers | string = 'chromium', config?: IBrowserConfig) {
    this.config = { ...defaultBrowserConfig, ...(config || {}) };
    this.browser = this._detectBrowserType(browserType);
    this.state = { url: '', pageTitle: '' };
  }

  _detectBrowserType(browserType: SupportedBrowsers | string): BrowserUsed {
    const lowerType = String(browserType).toLowerCase();
    let browser: SupportedBrowsers = 'chromium'
    if (lowerType.includes('chrome') || lowerType.includes('chromium')) {
      browser = 'chromium'
    }
    if (lowerType.includes('firefox')) {
      browser = 'firefox'
    }
    if (lowerType.includes('webkit')) {
      browser = 'webkit'
    }
    if (checkExecutablePath(browserType)) {
      return {
        type: browser,
        isExecutablePath: true,
      };
    }
    return { type: 'chromium', isExecutablePath: false };
  }

  _getBrowserType(browser: SupportedBrowsers): SupportedBrowsers {
    throw new Error('Method not implemented.');
  }
  _setupCDP(): Promise<Browser> {
    throw new Error('Method not implemented.');
  }
  _setupWSS(): Promise<Browser> {
    throw new Error('Method not implemented.');
  }
  _setupBrowserWithInstance(): Promise<Browser> {
    throw new Error('Method not implemented.');
  }
  _setupStandardBrowser(): Promise<Browser> {
    throw new Error('Method not implemented.');
  }
  _initBrowser(): Promise<Browser> {
    throw new Error('Method not implemented.');
  }
  newContext(config?: BrowserContextOptions): Promise<BrowserContext> {
    throw new Error('Method not implemented.');
  }
  navigate(url: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  screenshot(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getState(): IBrowserActionState {
    throw new Error('Method not implemented.');
  }
  closeBrowser(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  openBrowser(): Promise<Page> {
    throw new Error('Method not implemented.');
  }
  openTab(): Promise<Page> {
    throw new Error('Method not implemented.');
  }
  switchTab(tabIndex: number): Promise<Page> {
    throw new Error('Method not implemented.');
  }

}