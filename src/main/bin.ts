#!/usr/bin/env node

import { red } from 'kleur/colors';
import path from 'path';
import { startTasks } from './index.js';

const configPath = path.resolve(process.argv[2] || 'jointly.config');

let config;

try {
  config = require(configPath);
  config = config.default || config;
} catch (error) {
  die('Cannot load config: ' + configPath + '\n\n' + error);
}

if (!Array.isArray(config.tasks)) {
  die('There are no tasks to start');
}

startTasks(config.tasks).catch(error => {
  die(error.message);
});

function die(message: string): never {
  console.error(red(message));
  process.exit(1);
}
