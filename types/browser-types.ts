import {
  chromium,
  firefox,
  webkit,
  BrowserType,
  Browser,
  Page,
  BrowserContext,
  BrowserContextOptions,
} from 'playwright';


export interface IBrowserActionState {
  url: string;
  pageTitle: string;
  screenshotPath?: string;
  browserInstance?: Browser;
  pageInstance?: Page;
  contextInstance?: BrowserContext;
}

/**
 * Local definition for proxy settings.
 */
export type IProxySettings = {
  server: string;
  bypass?: string[];
};


export interface IBrowserConfig {
  // Basic configuration options
  cookiesFile?: string; // e.g., "path/to/cookies.json"
  waitForNetworkIdlePageLoadTime?: number; // in seconds
  browserWindowSize?: { width: number; height: number };
  locale?: string; // e.g., "en-US"
  userAgent?: string; // e.g., "Mozilla/5.0 ..."
  highlightElements?: boolean; // e.g., true
  viewportExpansion?: number; // e.g., 500
  allowedDomains?: string[]; // e.g., ['google.com', 'wikipedia.org']

  // Extended options (similar to your Python version)
  headless?: boolean; // run browser in headless mode (default: true)
  disableSecurity?: boolean; // disable security features (default: true)
  extraChromiumArgs?: string[]; // extra CLI arguments for Chromium
  chromeInstancePath?: string | null; // path to an existing Chrome instance
  wssUrl?: string | null; // WebSocket URL for remote browser
  cdpUrl?: string | null; // CDP URL for remote browser
  proxy?: IProxySettings | null; // proxy settings
  newContextConfig?: BrowserContextOptions; // additional options for new contexts
  _forceKeepBrowserAlive?: boolean; // internal flag to keep the browser alive
}

export type SupportedBrowsers = 'chromium' | 'firefox' | 'webkit' | 'chrome';

export interface BrowserUsed {
  type: SupportedBrowsers | string
  browser: BrowserType
  isExecutablePath?: boolean
}


export interface IBrowserManager {
  browser: BrowserUsed;
  state: IBrowserActionState;
  executablePath?: string;
  config: IBrowserConfig;
}

export interface IBrowserManagerConstructor {
  /**
    * Initializes the BrowserManager with the given browser type.
    * @param SupportedBrowsers - The type of browser to initialize (e.g., 'chromium', 'firefox', etc.).
    * @param config - Optional configuration for the browser instance.
    * @returns The BrowserManager instance.
    */
  new(browser: SupportedBrowsers | string, config?: IBrowserConfig): IBrowserManager;

  /**
   * Detects browser type based on the executable path.
   * @param executablePath - The path to the browser executable.
   * @returns The detected browser type.
   */
  _detectBrowserType(executablePath: string): BrowserUsed

  /**
   * Sets up the browser using the Chrome DevTools Protocol (CDP) connection.
   * @returns A Promise resolving to the Browser instance.
   */
  _setupCDP(): Promise<Browser>

  /**
   * Sets up the browser using a WebSocket Secure (WSS) connection.
   * @returns A Promise resolving to the Browser instance.
   */
  _setupWSS(): Promise<Browser>

  /**
   * Attempts to connect to an existing browser instance using the provided path.
   * @returns A Promise resolving to the Browser instance.
   */
  _setupBrowserWithInstance(): Promise<Browser>

  /**
   * Sets up a standard browser (new instance).
   * @returns A Promise resolving to the Browser instance.
   */
  _setupStandardBrowser(): Promise<Browser>

  /**
   * Initializes the browser with the appropriate configuration.
   * @returns A Promise resolving to the Browser instance.
   */
  _initBrowser(): Promise<Browser>

  // Public
  /**
   * Creates a new browser context with the provided configuration.
   * @param config - Optional configuration for the new context.
   * @returns A Promise resolving to a new BrowserContext.
   */
  newContext(config?: BrowserContextOptions): Promise<BrowserContext>

  /**
   * Navigates to the specified URL in the browser.
   * @param url - The URL to navigate to.
   * @returns A Promise that resolves once navigation is complete.
   */
  navigate(url: string): Promise<void>

  /**
   * Takes a screenshot of the current page in webp format.
   * @returns A Promise that resolves to a base64-encoded webp screenshot.
   */
  screenshot(): Promise<string>

  /**
   * Retrieves the current state of the browser.
   * @returns The current BrowserActionState.
   */
  getState(): IBrowserActionState

  /**
   * Closes the browser instance.
   * @returns A Promise that resolves when the browser is closed.
   */
  closeBrowser(): Promise<void>

  /**
   * Opens a new browser window with a new page.
   * @returns A Promise that resolves to the Page instance.
   */
  openBrowser(): Promise<Page>

  /**
   * Opens a new tab (new page) in the existing browser context.
   * @returns A Promise resolving to the newly opened Page.
   */
  openTab(): Promise<Page>

  /**
   * Switches to an existing tab by index.
   * @param tabIndex - The index of the tab to switch to (0-based index).
   * @returns A Promise resolving to the switched Page instance.
   * @throws If the tab index is invalid.
   */
  switchTab(tabIndex: number): Promise<Page>
}

/**
 * Represents the details of a bounding box for an element on a page.
 */
export interface IBBox {

  x: number; //  The x-coordinate of the bounding box (top-left corner).
  y: number; // The y-coordinate of the bounding box (top-left corner).
  type: any; // The type of the element (e.g., text, image, button, etc.).
  text: any; // The text content of the element (if applicable, e.g., for text-based elements).
  ariaLabel: any; // The aria-label of the element (used for accessibility purposes).
  img: string; //  The image source URL or path associated with the element, if it's an image.
}

/**
 * Represents a page that contains marked elements with their bounding boxes.
 */
export interface IMarkPage {
  bboxes: IBBox[]; // An array of bounding boxes representing elements on the page.
  img: string; // The image associated with the page being marked.
}

/**
 * Defines the interface for browser operations related to marking and unmarking pages.
 * This interface relies on an IBrowserManager instance for managing the browser.
 */
export interface IBrowserMarkdown {

  /**
   * The browser manager instance used for managing the browser state and operations.
   */
  browserManager: IBrowserManager;

  /**
   * Initializes a new instance of IBrowserMarkdown with the provided browser manager.
   * @param browser - The browser manager instance to use for marking pages.
   * @returns A new instance of IMarkPage.
   */
  new(browser: IBrowserManager): IMarkPage;

  /**
   * Marks the elements on the page by collecting their bounding boxes and image.
   * @returns A Promise that resolves to an IMarkPage containing the bounding boxes and image.
   */
  markpages(): Promise<IMarkPage>;

  /**
   * Unmarks the pages, clearing any previous markings or bounding box data.
   * @returns A Promise that resolves when the unmarking operation is complete.
   */
  unmarkPages(): Promise<void>;
}



/**
 * Represents the result of a browser action with content and error information.
 */
export interface IBrowserActionResult {
  done?: boolean; // Indicates whether the action was completed successfully.
  content: Array<string>; // The content resulting from the action performed (e.g., a list of extracted data or messages).
  error: Array<string>; // The errors encountered during the action (if any).
}

export interface GoogleSearchParam {
  query: string;
}

export interface NavigateParam {
  url: string;
}

export interface ClickElementParam {
  index: number; // The index of the element to click on.
  xpath?: string; // Optional XPath of the element to click on.
}

export interface InputTestParam {
  text: string; // The text to be entered into the input field.
}

export interface SwitchTabParam {
  pageID: number; // The ID of the tab to switch to.
}

export interface OpenTabParam {
  pageID: number; // The ID of the new tab to open.
}

export interface ExtractContentParam {
  pageID: number; // The ID of the page from which to extract content.
}

export interface ScrollParam {
  amount: number; // The number of pixels to scroll. If undefined, scrolls one full page.
}

/**
 * Interface for the browser actions that can be performed in the current browser tab.
 */
export interface IBrowserActions {
  /**
   * Performs a Google search with the provided query.
   * @param value - The search query.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _googleSearch(value: GoogleSearchParam): Promise<IBrowserActionResult>;

  /**
   * Navigates to a specified URL in the current browser tab.
   * @param value - The URL to navigate to.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _navigate(value: NavigateParam): Promise<IBrowserActionResult>;

  /**
   * Navigates back to the previous page in the browsing history.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _goBack(): Promise<IBrowserActionResult>;

  /**
   * Simulates a mouse click on a target element.
   * @param value - The index or XPath of the element to click on.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _clickElement(value: ClickElementParam): Promise<IBrowserActionResult>;

  /**
   * Enters text into a target input field.
   * @param value - The text to be entered into the input field.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _inputText(value: InputTestParam): Promise<IBrowserActionResult>;

  /**
   * Switches focus to a different browser tab by index or page ID.
   * @param value - The tab to switch to, identified by its pageID.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _switchTab(value: SwitchTabParam): Promise<IBrowserActionResult>;

  /**
   * Opens a new browser tab and loads the specified URL.
   * @param value - The tab information, including pageID.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _openTab(value: OpenTabParam): Promise<IBrowserActionResult>;

  /**
   * Extracts specific content from the webpage based on the page ID.
   * @param value - The page ID from which to extract content.
   * @returns A promise that resolves to a BrowserActionResult containing the extracted content.
   */
  _extractContent(value: ExtractContentParam): Promise<IBrowserActionResult>;

  /**
   * Scrolls upward on the webpage by a specified number of pixels.
   * @param value - The scroll amount (in pixels) to scroll up.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _scrollUp(value: ScrollParam): Promise<IBrowserActionResult>;

  /**
   * Scrolls downward on the webpage by a specified number of pixels.
   * @param value - The scroll amount (in pixels) to scroll down.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _scrollDown(value: ScrollParam): Promise<IBrowserActionResult>;

  /**
   * Simulates pressing special keys or key combinations.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _sendKeys(): Promise<IBrowserActionResult>;

  /**
   * Scrolls the webpage until a specific text or element is visible.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _scrollText(): Promise<IBrowserActionResult>;

  /**
   * Retrieves all available options from a specified native dropdown element.
   * @returns A promise that resolves to a BrowserActionResult containing the list of options.
   */
  _getDropdownOptions(): Promise<IBrowserActionResult>;

  /**
   * Selects a specific option from a native dropdown element.
   * @returns A promise that resolves to a BrowserActionResult containing the result.
   */
  _selectDropdownOptions(): Promise<IBrowserActionResult>;

  /**
 * Executes a series of browser actions and returns the result.
 * This method takes a callback function that is invoked with the result of the action.
 * @param callback - A callback function that receives the result of the action as a parameter.
 * @returns A promise that resolves to a BrowserActionResult containing the result of the series of actions.
 */
  execute(callback: (value: IBrowserActionResult) => void): Promise<IBrowserActionResult>;

}
