#!/usr/bin/env node
import { run } from '../dist/cli.js';

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
