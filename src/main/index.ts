import { ChildProcess, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { blue, cyan, green, magenta, red, yellow } from 'kleur/colors';

export interface Task extends SpawnOptionsWithoutStdio {
  name: string;
  command: string;
  args?:  readonly string[];
  resolveAfter?: 'exit' | ((str: string) => boolean);
  required?: boolean;
  dependsOn?: string[];
}

export const labelColors = [red, blue, magenta, yellow, cyan, green];

export function start(tasks: Task[]) {
  const labelLength = tasks.reduce((length, task) => Math.max(length, String(task.name).length), 0) + 2;
  const processes: ChildProcess[] = [];

  let promise: Promise<unknown> = Promise.resolve();
  let taskIndex = 0;

  for (const group of groupTasks(tasks)) {
    promise = promise.then(() =>
      Promise.all(
        group.map(task =>
          launchTask(
            labelColors[taskIndex++ % labelColors.length](task.name.padEnd(labelLength) + '|'),
            task,
            process => {
              processes.push(process);
            }
          )
        )
      )
    );
  }

  // Kill processes on failure
  promise.catch(() => {
    for (const process of processes) {
      process.kill('SIGINT');
    }
  });
}

export function groupTasks(tasks: Task[]): Task[][] {
  const groups = [];

  for (let dependents = tasks.slice(0); dependents.length !== 0;) {
    const group = dependents.filter(
      task => !Array.isArray(task.dependsOn) || !dependents.some(dependent => task.dependsOn!.includes(dependent.name))
    );
    if (group.length === 0) {
      throw new Error('Cyclic dependency');
    }

    dependents = dependents.filter(task => !group.includes(task));
    groups.push(group);
  }
  return groups;
}

export function launchTask(label: string, task: Task, onProcessStarted: (childProcess: ChildProcess) => void): Promise<void> {
  return new Promise((resolveTask, rejectTask) => {
    const {resolveAfter, required} = task;

    const childProcess = spawn(task.command, task.args, task);

    onProcessStarted(childProcess);

    const lfPattern = /\n(?!$)/g;

    let buffer = '';

    const printLine = (str: string) => {
      let line = '';

      if (str.length === 0) {
        // Nothing to print
        return line;
      }

      if (str.charAt(str.length - 1) === '\n') {
        // LF-terminated string
        printString((line = buffer + str));
        buffer = '';
        return line;
      }

      const lfIndex = str.indexOf('\n');

      if (lfIndex !== -1) {
        // LF-terminated substring
        printString((line = buffer + str.substring(0, lfIndex + 1)));
        buffer = str.substring(lfIndex + 1);
        return line;
      }

      // Unterminated string
      buffer += str;
      return line;
    };

    const printString = (str: string) => {
      process.stdout.write(label + ' ' + str.replace(lfPattern, '$&' + label + ' '));
    };

    const writeToStdout = (data: string) => {
      printLine(data.toString());
    };

    childProcess.on('exit', exitCode => {
      // Flush buffer to stdout on exit
      if (buffer.length !== 0) {
        printString(buffer + '\n');
      }

      if (exitCode === null || exitCode === 0) {
        return;
      }

      // Kill the sequence if the task has failed
      if (required) {
        rejectTask();
      }
    });

    let dataListener = writeToStdout;

    if (typeof resolveAfter === 'function') {
      dataListener = data => {
        if (resolveAfter(stripEscapeCodes(printLine(data.toString())))) {
          childProcess.stdout.off('data', dataListener).on('data', writeToStdout);
          childProcess.stderr.off('data', dataListener).on('data', writeToStdout);
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
}

export const escapeCodeRe = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export function stripEscapeCodes(str: string): string {
  return str.replace(escapeCodeRe, '');
}