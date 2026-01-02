<p align="center">
  <a href="#readme"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo-light.png" />
    <img alt="Jointly" src="./assets/logo-light.png" width="500" />
  </picture></a>
</p>

Run multiple processes from a single terminal.

Put your config in _jointly.config.js_ (other JS and TS extensions are also supported).

```ts
import { defineConfig } from 'jointly';

export default defineConfig({
  tasks: [
    {
      command: 'vite',
    },
    {
      command: 'tsc',
      args: ['--watch', '--preserveWatchOutput', '--pretty'],
    },
  ],
});
```

To start tasks run:

```shell
npx jointly
```

You can explicitly specify a configuration file path:

```shell
npx jointly --config my-config.js
```

# Task dependencies

Tasks can depend on each other. Here's an example where `tsc` type checker is started in parallel with `vite build`,
while `docker` waits for `vite` to emit built assets and then builds and starts the container.

```ts
export default defineConfig({
  tasks: [
    {
      command: 'tsc',
      args: ['--watch', '--preserveWatchOutput', '--pretty'],
      resolveAfter: 'exit',
    },
    {
      key: 'vite-build',
      command: 'vite',
      args: ['build', '--watch'],

      // Receives each line vite outputs to stdout
      resolveAfter: line => line.includes('built in'),
    },
    {
      command: 'docker',
      args: ['compose', 'up', '--build', '--watch'],
      dependencies: ['vite-build'],
    },
  ],
});
```

All processes continue running in parallel until the terminal is closed.

# Environment variables

By default, all environment variables are accessible inside a task process. To overwrite environment variables, specify
`env` object for a task:

```ts
export default defineConfig({
  tasks: [
    {
      command: 'printenv',
      args: ['HELLO'],
      env: {
        // ⚠️ Replaces all environment variables!
        HELLO: 'Hello world!',
      },
    },
  ],
});
```

The `env` object replaces the entire environment. To extend the parent environment, use `process.env`:

```ts
export default defineConfig({
  tasks: [
    {
      command: 'printenv',
      args: ['HELLO'],
      env: {
        // ✅ Environment variables are preserved!
        ...process.env,
        HELLO: 'Hello world!',
      },
    },
  ],
});
```

# Kill signal

Different processes may require different kill signals. Specify a kill signal for a task:

```ts
export default defineConfig({
  tasks: [
    {
      command: 'ping',
      args: ['google.com'],
      killSignal: 'SIGTERM',
    },
  ],
});
```

By default, `SIGINT` is used, which is intended to interrupt the currently running process and return control to
the user prompt.

# Task timeouts

Add timeouts to prevent tasks from running indefinitely:

```ts
import { defineConfig } from 'jointly';

export default defineConfig({
  tasks: [
    {
      command: 'slow-script',
      timeout: 30_000, // 30 seconds
      killSignal: 'SIGTERM',
    },
  ],
});
```

# Cookbook

## Build packages in monorepo

Manage multiple packages in a monorepo:

```ts
import { defineConfig } from 'jointly';

export default defineConfig({
  tasks: [
    {
      key: 'build-shared',
      command: 'npm',
      args: ['run', 'build'],
      cwd: './packages/shared',
      resolveAfter: 'exit',
    },
    {
      command: 'npm',
      args: ['run', 'build'],
      cwd: './packages/app',
      dependencies: ['build-shared'],
    },
    {
      command: 'npm',
      args: ['run', 'build'],
      cwd: './packages/admin',
      dependencies: ['build-shared'],
    },
  ],
});
```

## Dynamic configuration

Generate your configuration dynamically:

```ts
import { readdirSync } from 'node:fs';
import { defineConfig, type Task } from 'jointly';

const tasks: Task[] = [];

for (const entry of readdirSync('./packages', { withFileTypes: true })) {
  if (entry.isDirectory()) {
    tasks.push({
      key: 'build-' + entry.name,
      command: 'npm',
      args: ['run', 'build'],
      cwd: './packages/' + entry.name,
      label: entry.name,
    });
  }
}

export default defineConfig({ tasks });
```

You can conditionally execute tasks via dynamic configuration:

```ts
import { defineConfig, type Task } from 'jointly';

const tasks: Task[] = [
  {
    command: 'vite',
  },
];

if (process.env.RUN_TESTS === '1') {
  tasks.push({
    command: 'vitest',
    args: ['watch'],
  });
}

export default defineConfig({ tasks });
```

Then pass `RUN_TESTS` environment variable to `jointly`:

```shell
RUN_TESTS=1 npx jointly
```
