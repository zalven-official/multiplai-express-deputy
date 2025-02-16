import { BrowserManager } from "./browser";
import { IBrowserConfig } from "./types";


async function useBrowserManager() {
  //   try {

  const browserManager = new BrowserManager();
  const page = await browserManager.openBrowser();
  await browserManager.navigate('https://example.com');

  //     const screenshotBase64 = await browserManager.screenshot();
  //     console.log('Screenshot taken, base64 string:', screenshotBase64);


  //     await browserManager.closeBrowser();
  //   } catch (error) {
  //     console.error('Error using BrowserManager:', error);
  //   }
}

// // Run the example

useBrowserManager()
