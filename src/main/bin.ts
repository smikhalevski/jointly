import path from 'path';
import { start } from './index';

const configPath = path.resolve(process.argv[2] || 'watcher.config.js');

start(require(configPath));
