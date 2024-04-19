#!/usr/bin/env node

import path from 'path';
import { start } from './index';

const configPath = path.resolve(process.argv[2] || 'jointly.config');

start(require(configPath));
