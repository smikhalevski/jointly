import { ChildProcess, spawn } from 'node:child_process';
import { blue, cyan, green, magenta, red, yellow } from './echo.js';
import { Task } from './index.js';

const labelColors = [blue, red, magenta, yellow, cyan, green];

/**
 * Starts execution of tasks.
 *
 * @param tasks Tasks to executor.
 * @returns The promise that is resolved as soon as all tasks have exited.
 */
export function startTasks(tasks: Task[]): Promise<void> {
  const labelLength = tasks.reduce((length, task) => Math.max(length, getLabel(task).length), 0) + 2;
  const launchedTasks: { task: Task; childProcess: ChildProcess }[] = [];

  let promise: Promise<unknown> = Promise.resolve();
  let taskIndex = 0;

  for (const taskGroup of groupTasks(tasks)) {
    promise = promise.then(() =>
      Promise.all(
        taskGroup.map(task => {
          const labelColor = labelColors[taskIndex++ % labelColors.length];
          const label = getLabel(task).padEnd(labelLength) + '|';
          const { childProcess, promise } = launchTask(labelColor(label), task);

          launchedTasks.push({ task, childProcess });

          return promise;
        })
      )
    );
  }

  return promise.then(
    () => undefined,
    () => {
      // Kill all child processes on failure
      for (const { task, childProcess } of launchedTasks) {
        childProcess.kill(task.killSignal || 'SIGINT');
      }
    }
  );
}

export function groupTasks(tasks: Task[]): Task[][] {
  const taskGroups: Task[][] = [];

  for (let taskDependents = tasks.slice(0); taskDependents.length !== 0; ) {
    const taskGroup = taskDependents.filter(
      task =>
        !Array.isArray(task.dependencies) ||
        !taskDependents.some(dependent => dependent.key !== undefined && task.dependencies!.includes(dependent.key))
    );

    if (taskGroup.length === 0) {
      throw new Error('Cyclic dependency');
    }

    taskDependents = taskDependents.filter(task => !taskGroup.includes(task));
    taskGroups.push(taskGroup);
  }

  return taskGroups;
}

function launchTask(label: string, task: Task): { childProcess: ChildProcess; promise: Promise<void> } {
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
    process.stdout.write(label + ' ' + str.replace(/\n(?!$)/g, '$&' + label + ' '));
  };

  const printToStdout = (data: Buffer | string): void => {
    printLine(data.toString());
  };

  const childProcess = spawn(task.command, task.args, { ...task, detached: false, windowsHide: true });

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

function stripEscapeCodes(str: string): string {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function getLabel(task: Task): string {
  return task.label || task.key || task.command;
}
