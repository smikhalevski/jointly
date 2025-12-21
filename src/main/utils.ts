import { blue, dim, echo, underline } from './echo.js';

export function printHelp(): void {
  echo(`jointly: Run multiple processes in parallel. 

${dim('jointly [...options]')}

    ${dim('--help')}  Print this message.
    
  ${dim('--config')}  Run the project given the path to its configuration file.

  ${dim('--silent')}  Suppress all output.

   ${dim('--color')}  Force colorized output.

Visit ${blue(underline('https://megastack.dev/jointly'))} for docs and tutorials.
`);
}

export function printError(error: unknown): void {
  echo(error instanceof Error ? error.message : '' + error);
}
