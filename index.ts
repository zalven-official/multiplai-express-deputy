import { BrowserManager } from "./browser";
import { IBrowserConfig } from "./types";

import { BrowserInstanceFinder } from "./browser/browser-instances";


async function useBrowserManager() {
  //   try {

  const browserManager = new BrowserManager("/Applications/Goteam tools/Google Chrome.app/Contents/MacOS/Google Chrome");
  await browserManager.openBrowser();
  await browserManager.navigate('https://app.slack.com/client/TUBBZEYFK/CUMF4SKFA');

  //     const screenshotBase64 = await browserManager.screenshot();
  //     console.log('Screenshot taken, base64 string:', screenshotBase64);


  //     await browserManager.closeBrowser();
  //   } catch (error) {
  //     console.error('Error using BrowserManager:', error);
  //   }
}

// // Run the example

useBrowserManager()

