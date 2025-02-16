import { BrowserManager } from "./browser";
import { IBrowserConfig } from "./types";

import { BrowserInstanceFinder } from "./browser/browser-instances";


async function useBrowserManager() {

  const browserManager = new BrowserManager(
    "/Applications/Goteam tools/Google Chrome.app/Contents/MacOS/Google Chrome",
  );
  await browserManager.openBrowser();
  await browserManager.navigate('https://app.slack.com/client/TUBBZEYFK/CUMF4SKFA');
}

useBrowserManager()

