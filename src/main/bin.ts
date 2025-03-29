#!/usr/bin/env node

import { red } from 'kleur/colors';
import path from 'path';
import { startTasks } from './index.js';

const configPath = path.resolve(process.argv[2] || 'jointly.config');

startTasks(require(configPath)).catch(error => {
  console.log(red(error.message));
});
