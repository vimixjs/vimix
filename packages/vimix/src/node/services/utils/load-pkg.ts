import fs from 'fs';
import path from 'path';

export default (rootDir: string): Record<string, any> => {
  const resolvedPath = path.resolve(rootDir, 'package.json');
  let config = {};
  if (fs.existsSync(resolvedPath)) {
    try {
      config = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
    } catch (err) {
      console.info(
        `Fail to load config file ${resolvedPath}, use empty object`,
      );
    }
  }

  return config;
};
