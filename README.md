<p align="center">
  <a href="#readme"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo-light.png" />
    <img alt="Jointly" src="./assets/logo-light.png" width="500" />
  </picture></a>
</p>

Run multiple processes from a single terminal.

```shell
npm install jointly --save-dev
```

Create a configuration `jointly.config.json` (or `jointly.config.js`) with tasks that should be executed:

```json
[
  {
    "command": "ping",
    "args": ["google.com"]
  },
  {
    "command": "ping",
    "args": ["amazon.com"]
  }
]
```

To start tasks run:

```shell
jointly
```

You can explicitly pass a configuration file path:

```shell
jointly another.config.json
```

# Configuration

Each task supports following options:

<dl>

<dt><code>command</code></dt>
<dd>The shell command to execute.</dd>

<dt><code>args</code></dt>
<dd>The array of CLI arguments to pass to the command.</dd>

<dt><code>id</code></dt>
<dd>The unique ID of the task.</dd>

<dt><code>dependencies</code></dt>
<dd>The array of task IDs that must be resolved before this task.</dd>

<dt><code>resolveStrategy = 'start'</code></dt>
<dd>

Determines when the task is considered fulfilled and allows its dependants to start:

- `'start'` then dependants start immediately after this command is started.
- `'exit'` then dependents start only after the command exits.
- The callback that receives a line that command printed to the stdout and returns `true` if dependent tasks should
  be started, or `false` otherwise.

</dd>

<dt><code>rejectStrategy = 'auto'</code></dt>
<dd>

Determines when the task is considered failed:

- `'auto'` then the task is failed if the command exit code isn't 0.
- `'never'` then the task is never failed.
- The callback that returns `true` is the task must be considered failed for a particular exit code.

</dd>

<dt><code>cwd</code></dt>
<dd>The current working directory of the child process.</dd>

<dt><code>env</code></dt>
<dd>

The object with environment key-value pairs. By default, `process.env` is passed to a spawned task process.

</dd>

<dt><code>argv0</code></dt>
<dd>

Explicitly set the value of `argv[0]` sent to the child process. This will be set to `command` if not specified.

</dd>

<dt><code>uid</code></dt>
<dd>Sets the user identity of the process.</dd>

<dt><code>gid</code></dt>
<dd>Sets the group identity of the process.</dd>

<dt><code>shell = false</code></dt>
<dd>

If `false`, then no shell is available. If `true`, runs command inside of a shell. Uses `'/bin/sh'` on Unix, and
`process.env.ComSpec` on Windows. A different shell can be specified as a string.
See [Shell requirements](https://nodejs.org/api/child_process.html#shell-requirements)
and [Default Windows shell](https://nodejs.org/api/child_process.html#default-windows-shell).

</dd>

<dt><code>windowsVerbatimArguments = false</code></dt>
<dd>

No quoting or escaping of arguments is done on Windows. Ignored on Unix. This is set to `true` automatically when shell
is specified and is CMD.

</dd>

<dt><code>killSignal = 'SIGINT'</code></dt>
<dd>The signal value to be used when the spawned process will be killed by the abort signal.</dd>

<dt><code>timeout</code></dt>
<dd>In milliseconds the maximum amount of time the process is allowed to run.</dd>

</dl>
