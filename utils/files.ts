import fs from 'fs';
/**
 * Checks if the provided executable path exists.
 * @param executablePath - The path to check.
 * @returns true if the path exists, false otherwise.
 */
export function checkExecutablePath(executablePath: string): boolean {
  try {
    return fs.existsSync(executablePath);
  } catch {
    return false;
  }
}