import { BrowserType, Browser, BrowserContextOptions, BrowserContext, Page, chromium, firefox, webkit, Cookie } from 'playwright-core';
import { IBrowserConfig, IBrowserManager, BrowserUsed, IBrowserActionState, SupportedBrowsers } from '../types'
import { checkExecutablePath } from '../utils/files';
import { spawn } from 'child_process';
import fs from 'fs';

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
  wssUrl: null,
  cdpUrl: null,
  proxy: null,
  newContextConfig: {},
  _forceKeepBrowserAlive: false,
};

export class BrowserManager implements IBrowserManager {

  browser: BrowserUsed;
  state: IBrowserActionState & { pages: Page[] } = {
    url: '',
    pageTitle: '',
    pages: []
  };
  executablePath?: string;
  config: IBrowserConfig;

  constructor(browserType: SupportedBrowsers | string = 'chromium', config?: IBrowserConfig) {
    this.config = { ...defaultBrowserConfig, ...(config || {}) };
    this.browser = this._detectBrowserType(browserType);
    this.state = { ...this.state, pages: [] };
  }

  _detectBrowserType(browserType: SupportedBrowsers | string): BrowserUsed {
    const lowerType = String(browserType).toLowerCase();
    let type: SupportedBrowsers | string = 'chromium';
    let browser: BrowserType = chromium;
    if (lowerType.includes('chrome') || lowerType.includes('chromium')) {
      type = 'chromium';
      browser = chromium;
    }
    if (lowerType.includes('firefox')) {
      type = 'firefox';
      browser = firefox;
    }
    if (lowerType.includes('webkit')) {
      type = 'webkit';
      browser = webkit;
    }
    const isExecutablePath = checkExecutablePath(browserType);
    type = isExecutablePath ? browserType : type
    return { type, isExecutablePath, browser };
  }

  async _setupCDP(): Promise<Browser> {
    if (!this.config.cdpUrl) {
      throw new Error('CDP URL is required');
    }
    return await this.browser.browser.connectOverCDP(this.config.cdpUrl);
  }

  async _setupWSS(): Promise<Browser> {
    if (!this.config.wssUrl) {
      throw new Error('WSS URL is required');
    }
    return await this.browser.browser.connect(this.config.wssUrl);
  }

  async _setupBrowserWithInstance(): Promise<Browser> {
    const execPath = this.browser.type;
    if (!execPath || typeof execPath !== 'string') {
      throw new Error('Invalid browser path');
    }
    const endpointVersionUrl = 'http://localhost:9222/json/version';
    const endpointUrl = 'http://localhost:9222';
    try {
      const response = await fetch(endpointVersionUrl);
      if (response.ok) {
        const browser = await chromium.connectOverCDP(endpointUrl, { timeout: 20000 });
        return browser;
      }
    } catch (error) {
      //'No existing Chrome instance found, starting a new one'
    }
    spawn(execPath, [
      '--remote-debugging-port=9222',
      ...(this.config.extraChromiumArgs ?? []),
    ], { stdio: 'ignore', detached: true }
    ).unref();

    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch(endpointVersionUrl);
        if (response.ok) {
          break;
        }
      } catch (err) {
        continue;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    try {
      const browser = await chromium.connectOverCDP(endpointUrl, { timeout: 20000 });
      return browser;
    } catch (error: any) {
      throw new Error(
        'To start Chrome in Debug mode, you need to close all existing Chrome instances and try again otherwise we cannot connect to the instance.'
      );
    }
  }


  async _setupStandardBrowser(): Promise<Browser> {
    const launchOptions: any = {
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--disable-background-timer-throttling',
        '--disable-popup-blocking',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-window-activation',
        '--disable-focus-on-load',
        '--no-first-run',
        '--no-default-browser-check',
        '--no-startup-window',
        '--window-position=0,0',
        ...(this.config.disableSecurity
          ? [
            '--disable-web-security',
            '--disable-site-isolation-trials',
            '--disable-features=IsolateOrigins,site-per-process',
          ]
          : []),
        ...(this.config.extraChromiumArgs ?? []),
        ...(this.config.browserWindowSize
          ? [
            `--window-size=${this.config.browserWindowSize.width},${this.config.browserWindowSize.height}`,
          ]
          : []),
      ],
      proxy: this.config.proxy ?? undefined,
    };
    return await this.browser.browser.launch(launchOptions);
  }

  async _initBrowser(): Promise<Browser> {
    try {
      if (this.config.cdpUrl) {
        return await this._setupCDP();
      } else if (this.config.wssUrl) {
        return await this._setupWSS();
      } else if (this.browser.isExecutablePath) {
        return await this._setupBrowserWithInstance();
      } else {
        return await this._setupStandardBrowser();
      }
    } catch (error: any) {
      throw new Error(`Failed to initialize Playwright browser: ${error.message}`);
    }
  }

  async newContext(config?: BrowserContextOptions): Promise<BrowserContext> {
    const browser = this.state.browserInstance ?? (await this._initBrowser());
    const contextOptions = {
      viewport: this.config.browserWindowSize
        ? {
          width: this.config.browserWindowSize.width + (this.config.viewportExpansion ?? 0),
          height: this.config.browserWindowSize.height + (this.config.viewportExpansion ?? 0),
        }
        : undefined,
      userAgent: this.config.userAgent,
      locale: this.config.locale,
      ...this.config.newContextConfig,
      ...config,
    };
    const context = await browser.newContext(contextOptions);
    // Save the context so that all pages share the same data
    this.state.contextInstance = context;
    return context;
  }

  async openBrowser(): Promise<Page> {
    try {
      const browser = await this._initBrowser();
      const contextOptions = {
        viewport: this.config.browserWindowSize
          ? {
            width: this.config.browserWindowSize.width + (this.config.viewportExpansion ?? 0),
            height: this.config.browserWindowSize.height + (this.config.viewportExpansion ?? 0),
          }
          : undefined,
        userAgent: this.config.userAgent,
        locale: this.config.locale,
        ...this.config.newContextConfig,
      };

      const context = await browser.newContext(contextOptions);
      // Save the shared context instance
      this.state.contextInstance = context;

      // Load cookies if a cookies file is provided
      if (this.config.cookiesFile) {
        if (fs.existsSync(this.config.cookiesFile)) {
          try {
            const cookiesContent = fs.readFileSync(this.config.cookiesFile, 'utf-8');
            const cookies = JSON.parse(cookiesContent);
            if (!Array.isArray(cookies)) {
              throw new Error('Cookies file does not contain an array of cookies.');
            }
            await context.addCookies(cookies);
          } catch (err: any) {
            throw new Error(`Failed to load cookies from ${this.config.cookiesFile}: ${err.message}`);
          }
        } else {
          throw new Error(`Cookies file not found at path: ${this.config.cookiesFile}`);
        }
      }

      const page = await context.newPage();

      if (this.config.allowedDomains?.length) {
        await page.route('**/*', async (route, request) => {
          const url = request.url();
          const allowed = this.config.allowedDomains!.some((domain) => url.includes(domain));
          if (!allowed) {
            await route.abort();
          } else {
            await route.continue();
          }
        });
      }

      if (this.config.highlightElements) {
        await page.addStyleTag({
          content: '*:hover { outline: 2px solid red !important; }',
        });
      }
      this.state.browserInstance = browser;
      this.state.pageInstance = page;
      this.state.pages.push(page);
      return page;
    } catch (error: any) {
      throw new Error(`openBrowser failed: ${error.message}`);
    }
  }

  async openTab(): Promise<Page> {
    try {
      if (!this.state.contextInstance) {
        await this.openBrowser();
      }
      const newTab = await this.state.contextInstance!.newPage();
      this.state.pages.push(newTab);
      return newTab;
    } catch (error: any) {
      throw new Error(`openTab failed: ${error.message}`);
    }
  }

  async closeTab(page: Page): Promise<void> {
    try {
      const index = this.state.pages.indexOf(page);
      if (index !== -1) {
        await page.close();
        this.state.pages.splice(index, 1);
      }
    } catch (error: any) {
      throw new Error(`closeTab failed: ${error.message}`);
    }
  }

  async closeBrowser(): Promise<void> {
    try {
      for (const page of this.state.pages) {
        try {
          await page.close();
        } catch (err) {
          // Error closing a page
          continue
        }
      }
      this.state.pages = [];
      if (this.state.contextInstance) {
        await this.state.contextInstance.close();
        this.state.contextInstance = undefined;
      }
      if (this.state.browserInstance) {
        await this.state.browserInstance.close();
        this.state.browserInstance = undefined;
      }
    } catch (error: any) {
      throw new Error(`closeBrowser failed: ${error.message}`);
    }
  }

  async navigate(url: string): Promise<void> {
    if (!this.state.pageInstance) {
      throw new Error('Browser is not open. Please call openBrowser() first.');
    }
    try {
      await this.state.pageInstance.goto(url, { waitUntil: 'networkidle' });
      if (this.config.waitForNetworkIdlePageLoadTime) {
        await this.state.pageInstance.waitForTimeout(this.config.waitForNetworkIdlePageLoadTime * 1000);
      }
      this.state.url = url;
      this.state.pageTitle = await this.state.pageInstance.title();
    } catch (error: any) {
      throw new Error(`navigateTo failed while accessing ${url}: ${error.message}`);
    }
  }

  async screenshot(): Promise<string> {
    if (!this.state.pageInstance) {
      throw new Error('No page instance available. Please open a page before taking a screenshot.');
    }
    try {
      const screenshotBuffer = await this.state.pageInstance.screenshot();
      return screenshotBuffer.toString('base64');
    } catch (error: any) {
      throw new Error(`Screenshot failed: ${error.message}`);
    }
  }

  // Helper methods for shared cookie management
  async getCookies(): Promise<Cookie[]> {
    if (!this.state.contextInstance) {
      throw new Error('Browser context is not initialized.');
    }
    return await this.state.contextInstance.cookies();
  }

  async setCookies(cookies: Cookie[]): Promise<void> {
    if (!this.state.contextInstance) {
      throw new Error('Browser context is not initialized.');
    }
    await this.state.contextInstance.addCookies(cookies);
  }

  getState(): IBrowserActionState {
    return this.state;
  }
}
