# Web Deputy

Web Deputy is a cutting-edge framework that seamlessly integrates advanced AI capabilities with robust browser automation. Designed to empower AI agents, it enables intelligent, efficient, and error-free web interactions. By combining the best of AI decision-making with automated browser control, Web Deputy revolutionizes how applications navigate, interact, and extract data from the web, ensuring that complex tasks are handled with precision and speed.

## Features

- **AI Integration**: Utilizes AI decision-making for intelligent web interactions.
- **Browser Automation**: Automates web tasks with robust browser control.
- **Node.js Compatibility**: Built for Node.js applications.
- **TypeScript Support**: Provides TypeScript typings for enhanced development.

## Installation

```bash
npm install @multiplai-express/deputy
```

## Usage

```typescript

import { BrowserManager } from "web-deputy-js";
import { CloudLLMS } from "web-deputy-js";
import { VoyagerAgent } from "web-deputy-js";

async function main() {
  // Initialize CloudLLMS with your OpenAI API key
  const cloudLLm = new CloudLLMS({ openAIApiKey: process.env.OPENAI_API_KEY });

  // Initialize BrowserManager
  const browser = new BrowserManager();

  // Initialize VoyagerAgent with a task
  const voyager = new VoyagerAgent({
    task: "Could you check google maps to see when I should leave to get to SFO by 7 o'clock? Starting from SF downtown.",
    llm: cloudLLm.openAI('gpt-4o-mini'),
    browser: browser
  });

  // Stream output
  await voyager.stream((value) => {
    console.log(value);
  });

  // Close browser
  // browser.closeBrowser();
}

main();
```

## Documentation

For detailed documentation and examples, visit [Web Deputy GitHub Repository](https://github.com/zalven-official/multiplai-express-deputy#readme).

## Contributing

Contributions are welcome! Check out the [contribution guidelines](https://github.com/zalven-official/multiplai-express-deputy/blob/main/CONTRIBUTING.md) before getting started.

## License

MIT License. See [LICENSE](https://github.com/zalven-official/multiplai-express-deputy/blob/main/LICENSE) for details.

---

Feel free to adjust and expand on this template based on your specific needs and additional features of your package!