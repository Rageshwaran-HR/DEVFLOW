#!/usr/bin/env node
import { createCli } from "./cli.js";
import { DevFlowError, fail } from "./utils.js";

try {
  await createCli().parseAsync(process.argv);
} catch (error) {
  if (error instanceof DevFlowError) {
    fail(error.message);
    if (error.suggestion)
      console.error(`\nSuggested action:\n${error.suggestion}`);
    process.exitCode = error.exitCode;
  } else {
    fail(error instanceof Error ? error.message : "Unexpected error");
    process.exitCode = 1;
  }
}
