# jointly

Run multiple processes in parallel.

```shell
npm install jointly --save-dev
```

Create a configuration `jointly.config.json` with tasks that should be executed:

```json
[
  {
    "name": "ping-google",
    "command": "ping",
    "args": [
      "google.com"
    ]
  },
  {
    "name": "ping-amazon",
    "command": "ping",
    "args": [
      "amazon.com"
    ]
  }
]
```

Run start tasks use:

```shell
jointly
```

In the console you would see this output:

<p align="center">
    <img src="./assets/console.png" width="670">
</p>

You can specify multiple options for each task:

<dl>
<dt>name</dt>
<dd>The unique name of the task.</dd>

<dt>command</dt>
<dd>The command to execute.</dd>

<dt>args</dt>
<dd>The array of CLI arguments to pass to the command.</dd>

<dt>resolveAfter</dt>
<dd>

When this task allows its dependants to start.

The callback that receives a line that command printed to the stdout and returns `true` if dependent tasks should
be started. Or `'exit'` if the dependents should start only after this task exits.

</dd>

<dt>required</dt>
<dd>

If `true` then dependent tasks would fail if this one fails.

</dd>

<dt>dependsOn</dt>
<dd>The array of task names that must be resolved before this task.</dd>
</dl>
