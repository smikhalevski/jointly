#!/usr/bin/env node

import { red } from 'kleur/colors';
import path from 'path';
import { startTasks } from './index.js';

const configPath = path.resolve(process.argv[2] || 'jointly.config');

let config;

try {
  config = require(configPath);
} catch {
  die('Cannot load config: ' + configPath);
}

const tasks = config.default !== undefined ? config.default.tasks : config.tasks;

if (!Array.isArray(tasks)) {
  die('There are no tasks to start');
}

startTasks(tasks).catch(error => {
  die(error.message);
});

function die(message: string): never {
  console.error(red(message));
  process.exit(1);
}
