#!/usr/bin/env node

import { red } from 'kleur/colors';
import path from 'path';
import { startTasks } from './index.js';

const configPath = path.resolve(process.argv[2] || 'jointly.config');

let tasks;

try {
  tasks = require(configPath).tasks;
} catch {
  die('Cannot load config: ' + configPath);
}

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
