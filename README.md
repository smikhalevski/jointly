<p align="center">
  <a href="#readme"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo-light.png" />
    <img alt="Jointly" src="./assets/logo-light.png" width="500" />
  </picture></a>
</p>

Run multiple processes from a single terminal.

Create a configuration file `jointly.config.json`, `jointly.config.js`, `jointly.config.mjs` (requires NodeJS 23+) or
`jointly.config.ts` (requires NodeJS 23+) with tasks that should be executed:

```json
{
  "$schema": "https://raw.githubusercontent.com/smikhalevski/jointly/refs/tags/v0.0.3/schema.json",
  "tasks": [
    {
      "command": "vite"
    },
    {
      "command": "tsc",
      "args": ["--watch", "--preserveWatchOutput", "--pretty"]
    }
  ]
}
```

To start tasks run:

```shell
npx jointly
```

You can explicitly specify a configuration file path:

```shell
npx jointly my_config.json
```

# Environment variables

Specify environment variables for each task:

```json
{
  "tasks": [
    {
      "command": "printenv",
      "args": ["HELLO"],
      "env": {
        "HELLO": "Hello world!"
      }
    }
  ]
}
```

# Task dependencies

Tasks can depend on each other. Here's an example where `tsc` type checker is started in parallel with `vite build`,
while `docker` waits for `vite` to emit built assets and then builds and starts the container.

```js
export default {
  tasks: [
    {
      command: 'tsc',
      args: ['--watch', '--preserveWatchOutput', '--pretty'],
      resolveAfter: 'exit'
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
    }
  ]
}
```

All processes would proceed running in parallel until user prompt is closed.

# Kill signal

Different processes may require different kill signals. Specify a kill signal for a task:

```json
{
  "tasks": [
    {
      "command": "ping",
      "args": ["google.com"],
      "killSignal": "SIGTERM"
    }
  ]
}
```

By default, `SIGINT` is used, which is intended to interrupt the currently running process and return control to
the user prompt. 
