export interface Task {
  /**
   * The shell command to execute.
   */
  command: string;

  /**
   * The array of CLI arguments to pass to the command.
   */
  args?: string[];

  /**
   * The unique task key.
   */
  key?: string;

  /**
   * The label to render as the stdout prefix.
   *
   * If omitted, either {@link key} or {@link command} is used as the label.
   */
  label?: string;

  /**
   * Determines when the task is considered fulfilled and allows its dependents to start:
   *
   * - `start`: dependents start immediately after this command is started.
   * - `exit`: dependents start only after the command exits.
   * - A callback that receives a line printed to stdout and returns `true` if dependent tasks should be started,
   * or `false` otherwise.
   *
   * @default start
   */
  resolveAfter?: 'start' | 'exit' | ((str: string) => boolean);

  /**
   * Determines when the task is considered failed:
   *
   * - `auto`: the task fails if the command exit code is not 0.
   * - `never`: the task never fails.
   * - A callback that returns `true` if the task should be considered failed for a particular exit code.
   *
   * @default auto
   */
  rejectAfter?: 'auto' | 'never' | ((exitCode: number) => boolean);

  /**
   * The array of task keys that must be resolved before this task.
   */
  dependencies?: string[];

  /**
   * Explicitly sets the value of `argv[0]` passed to the task process.
   *
   * If not specified, it defaults to {@link command}.
   */
  argv0?: string;

  /**
   * The current working directory of the task process.
   *
   * @default process.cwd()
   */
  cwd?: string | URL;

  /**
   * Environment key-value pairs.
   *
   * @default process.env
   */
  env?: Record<string, string>;

  /**
   * Sets the user identity of the process.
   */
  uid?: number;

  /**
   * Sets the group identity of the process.
   */
  gid?: number;

  /**
   * The signal used to kill the process.
   */
  killSignal?: OSSignal | number;

  /**
   * The shell used to execute the command.
   *
   * Default: `/bin/sh` on Unix, `process.env.ComSpec` on Windows.
   */
  shell?: boolean | string;

  /**
   * Allows aborting the task process using an {@link AbortSignal}.
   */
  signal?: AbortSignal;

  // stdio?: 'pipe' | 'overlapped' | Array<'pipe' | 'overlapped' | null | undefined>;

  /**
   * If {@link timeout} is greater than 0, Jointly sends the signal specified by {@link killSignal} if the task process
   * runs longer than {@link timeout} milliseconds.
   */
  timeout?: number;

  /**
   * Disables quoting and escaping of arguments on Windows.
   *
   * @default false
   */
  windowsVerbatimArguments?: boolean;
}

export type OSSignal =
  | 'SIGABRT'
  | 'SIGALRM'
  | 'SIGBUS'
  | 'SIGCHLD'
  | 'SIGCONT'
  | 'SIGFPE'
  | 'SIGHUP'
  | 'SIGILL'
  | 'SIGINT'
  | 'SIGIO'
  | 'SIGIOT'
  | 'SIGKILL'
  | 'SIGPIPE'
  | 'SIGPOLL'
  | 'SIGPROF'
  | 'SIGPWR'
  | 'SIGQUIT'
  | 'SIGSEGV'
  | 'SIGSTKFLT'
  | 'SIGSTOP'
  | 'SIGSYS'
  | 'SIGTERM'
  | 'SIGTRAP'
  | 'SIGTSTP'
  | 'SIGTTIN'
  | 'SIGTTOU'
  | 'SIGUNUSED'
  | 'SIGURG'
  | 'SIGUSR1'
  | 'SIGUSR2'
  | 'SIGVTALRM'
  | 'SIGWINCH'
  | 'SIGXCPU'
  | 'SIGXFSZ'
  | 'SIGBREAK'
  | 'SIGLOST'
  | 'SIGINFO';

export interface Config {
  tasks: Task[];
}

export function defineConfig(config: Config): Config {
  return config;
}
