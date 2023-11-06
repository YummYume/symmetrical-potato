import packageJson from './package.json';

// From https://github.com/oven-sh/bun/issues/6351#issuecomment-1760508292
function getExternalsFromPackageJson(): string[] {
  const sections: (keyof typeof packageJson)[] = ['dependencies', 'devDependencies'];
  const externals: string[] = [];

  for (const section of sections) {
    if (packageJson[section]) {
      externals.push(...Object.keys(packageJson[section]));
    }
  }

  // Removing potential duplicates between dev and peer
  return Array.from(new Set(externals));
}

async function buildWithExternals(): Promise<void> {
  const externalDeps = getExternalsFromPackageJson();

  // @ts-expect-error Bun types conflict
  await Bun.build({
    entrypoints: ['./server.ts'],
    outdir: './',
    target: 'node',
    external: externalDeps,
    format: 'esm',
  });
}

buildWithExternals();
