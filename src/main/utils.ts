import { blue, dim, print, underline } from './print.js';

export function printHelp(): void {
  print(`jointly: Run multiple processes in parallel. 

${dim('jointly [...options]')}

    ${dim('--help')}  Print this message.
    
  ${dim('--config')}  Run the project given the path to its configuration file.

  ${dim('--silent')}  Suppress all output.

   ${dim('--color')}  Force colorized output.

Visit ${blue(underline('https://megastack.dev/jointly'))} for docs and tutorials.
`);
}

export function printError(error: unknown): void {
  print(error instanceof Error ? error.message : '' + error);
}
