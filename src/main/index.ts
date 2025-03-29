import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { blue, cyan, green, magenta, red, yellow } from 'kleur/colors';

export interface Task extends Omit<SpawnOptionsWithoutStdio, 'detached' | 'windowsHide'> {
  /**
   * The shell command to execute.
   */
  command: string;

  /**
   * The array of CLI arguments to pass to the command.
   */
  args?: readonly string[];

  /**
   * The unique task key.
   */
  key?: string;

  /**
   * The label to render as stdout prefix. If omitted then either {@link key} or {@link command} is used as a label.
   */
  label?: string;

  /**
   * Determines when the task is considered fulfilled and allows its dependants to start:
   *
   * - `start` then dependants start immediately after this command is started.
   * - `exit` then dependents start only after the command exits.
   * - The callback that receives a line that command printed to the stdout and returns `true` if dependent tasks should
   * be started, or `false` otherwise.
   *
   * @default start
   */
  resolveAfter?: 'start' | 'exit' | ((str: string) => boolean);

  /**
   * Determines when the task is considered failed:
   *
   * - `auto` then the task is failed if the command exit code isn't 0.
   * - `never` then the task is never failed.
   * - The callback that returns `true` is the task must be considered failed for a particular exit code.
   *
   * @default auto
   */
  rejectAfter?: 'auto' | 'never' | ((exitCode: number) => boolean);

  /**
   * The array of task keys that must be resolved before this task.
   */
  dependencies?: string[];
}

export interface StartTasksOptions {
  /**
   * An array of functions that receive a label and must return the string with color escape codes.
   */
  labelColors?: ReadonlyArray<(str: string) => string>;
}

const defaultLabelColors = [red, blue, magenta, yellow, cyan, green];

/**
 * Starts execution of tasks.
 *
 * @param tasks Tasks to executor.
 * @param options Additional options.
 * @returns The promise that is resolved as soon as all tasks have exited.
 */
export function startTasks(tasks: Task[], options: StartTasksOptions = {}): Promise<void> {
  const { labelColors = defaultLabelColors } = options;
  const labelLength = tasks.reduce((length, task) => Math.max(length, getLabel(task).length), 0) + 2;
  const launchedTasks: [Task, ChildProcess][] = [];

  let promise: Promise<unknown> = Promise.resolve();
  let taskIndex = 0;

  for (const taskGroup of groupTasks(tasks)) {
    promise = promise.then(() =>
      Promise.all(
        taskGroup.map(task => {
          const labelColor = labelColors[taskIndex++ % labelColors.length];
          const label = getLabel(task).padEnd(labelLength) + '|';
          const { childProcess, promise } = launchTask(labelColor !== undefined ? labelColor(label) : label, task);

          launchedTasks.push([task, childProcess]);

          return promise;
        })
      )
    );
  }

  return promise.then(noop, () => {
    // Kill all child processes on failure
    for (const [task, childProcess] of launchedTasks) {
      childProcess.kill(task.killSignal || 'SIGINT');
    }
  });
}

export function groupTasks(tasks: Task[]): Task[][] {
  const groups = [];

  for (let dependents = tasks.slice(0); dependents.length !== 0; ) {
    const group = dependents.filter(
      task =>
        !Array.isArray(task.dependencies) ||
        !dependents.some(dependent => dependent.key !== undefined && task.dependencies!.includes(dependent.key))
    );

    if (group.length === 0) {
      throw new Error('Cyclic dependency');
    }

    dependents = dependents.filter(task => !group.includes(task));
    groups.push(group);
  }
  return groups;
}

export function launchTask(label: string, task: Task): { childProcess: ChildProcess; promise: Promise<void> } {
  let buffer = '';

  const printLine = (str: string): string => {
    let line = '';

    if (str.length === 0) {
      // Nothing to print
      return line;
    }

    if (str.charAt(str.length - 1) === '\n') {
      // LF-terminated string
      line = buffer + str;
      buffer = '';
      printLabelLine(line);
      return line;
    }

    const lfIndex = str.indexOf('\n');

    if (lfIndex !== -1) {
      // LF-terminated substring
      line = buffer + str.substring(0, lfIndex + 1);
      buffer = str.substring(lfIndex + 1);
      printLabelLine(line);
      return line;
    }

    // Unterminated string
    buffer += str;
    return line;
  };

  const printLabelLine = (str: string): void => {
    process.stdout.write(label + ' ' + str.replace(lfRe, '$&' + label + ' '));
  };

  const printToStdout = (data: Buffer | string): void => {
    printLine(data.toString());
  };

  const childProcess = spawn(task.command, task.args, Object.assign({}, task, { detached: false, windowsHide: true }));

  const promise = new Promise<void>((resolveTask, rejectTask) => {
    const { resolveAfter, rejectAfter } = task;

    childProcess.on('exit', exitCode => {
      // Flush buffer to stdout on exit
      if (buffer.length !== 0) {
        printLabelLine(buffer + '\n');
      }

      if (rejectAfter === 'never') {
        return;
      }

      if (typeof rejectAfter === 'function') {
        if (rejectAfter(exitCode || 0)) {
          rejectTask();
        }
        return;
      }

      if (exitCode === null || exitCode === 0) {
        return;
      }

      // Kill the sequence if the task has failed
      rejectTask();
    });

    let dataListener = printToStdout;

    if (typeof resolveAfter === 'function') {
      dataListener = data => {
        if (resolveAfter(stripEscapeCodes(printLine(data.toString())))) {
          childProcess.stdout.off('data', dataListener).on('data', printToStdout);
          childProcess.stderr.off('data', dataListener).on('data', printToStdout);
          resolveTask();
        }
      };
    } else if (resolveAfter === 'exit') {
      childProcess.on('exit', () => {
        resolveTask();
      });
    } else {
      resolveTask();
    }

    childProcess.stdout.on('data', dataListener);
    childProcess.stderr.on('data', dataListener);
  });

  return { childProcess, promise };
}

const lfRe = /\n(?!$)/g;

const escapeCodeRe = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export function stripEscapeCodes(str: string): string {
  return str.replace(escapeCodeRe, '');
}

export function getLabel(task: Task): string {
  return task.label || task.key || task.command;
}

function noop() {}
