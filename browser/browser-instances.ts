import { IBrowserInstance, IBrowserInstanceFinder } from "../types";
import psList from 'ps-list';


export class BrowserInstanceFinder implements IBrowserInstanceFinder {


  _extractExecutablePath(cmd: string): string {
    const match = cmd.match(/^(?:"([^"]+)"|(\S+))/);
    return match ? (match[1] || match[2]) : cmd;
  }

  async instances(): Promise<IBrowserInstance[]> {
    const processes = await psList();
    const browserProcesses = processes.filter(proc => {
      const name = proc.name.toLowerCase();
      return (
        name.includes('chrome') ||
        name.includes('chromium') ||
        name.includes('firefox')
      );
    });

    const instances: IBrowserInstance[] = [];
    for (const proc of browserProcesses) {
      if (!proc.cmd) {
        continue;
      }
      const portMatch = proc.cmd.match(/--remote-debugging-port=(\d+)/);
      if (portMatch && portMatch[1]) {
        instances.push({
          executablePath: this._extractExecutablePath(proc.cmd),
          port: parseInt(portMatch[1], 10)
        });
      }
    }
    return instances;
  }


}