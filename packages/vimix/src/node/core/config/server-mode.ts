export type ServerMode = 'development' | 'production' | 'test';

export function isValidServerMode(mode: string): mode is ServerMode {
  return mode === 'development' || mode === 'production' || mode === 'test';
}
