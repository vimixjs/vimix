import { resolveConfig } from '../core';

export async function prepare(root: string, opts: any) {
  const config = await resolveConfig({
    root,
    mode: 'production',
  });
  console.log(prepare);
}
