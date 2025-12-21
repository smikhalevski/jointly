#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { startTasks } from '../startTasks.js';
import { echo } from '../echo.js';
import { printError, printHelp } from '../utils.js';

echo.isColorized = process.stdout.isTTY && process.env.FORCE_COLOR !== '0';

const fallbackConfigPaths = ['jointly.config.ts', 'jointly.config.js', 'jointly.config.mts', 'jointly.config.mjs'];

let argvConfigPath;

for (let i = 2; i < process.argv.length; ++i) {
  switch (process.argv[i]) {
    case '--help':
      echo.isSilent = false;
      printHelp();
      process.exit(0);
      break;

    case '--config':
      argvConfigPath = process.argv[++i];
      break;

    case '--silent':
      echo.isSilent = true;
      break;

    case '--color':
      echo.isColorized = true;
      break;
  }
}

try {
  const configPath = resolveConfigPath(process.cwd(), argvConfigPath ? [argvConfigPath] : fallbackConfigPaths);

  const { default: config } = await import(configPath);

  await startTasks(config.tasks);
} catch (error) {
  printError(error);
  process.exit(1);
}

function resolveConfigPath(baseDir: string, configPaths: string[]): string {
  configPaths = configPaths.map(configPath => path.resolve(baseDir, configPath));

  const configPath = configPaths.find(configPath => fs.existsSync(configPath));

  if (configPath === undefined) {
    throw new Error('Config not found among paths:\n  ' + configPaths.join('\n  ') + '\n');
  }

  return configPath;
}
