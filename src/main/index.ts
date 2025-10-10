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

  argv0?: string;
  cwd?: string | URL;
  env?: Record<string, string>;
  gid?: number;
  killSignal?: OSSignal | number;
  shell?: boolean | string;
  signal?: AbortSignal;
  stdio?: 'pipe' | 'overlapped' | Array<'pipe' | 'overlapped' | null | undefined>;
  timeout?: number;
  uid?: number;
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
