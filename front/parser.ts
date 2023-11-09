import chokidar from 'chokidar';
import { load } from 'js-yaml';

import {
  lstatSync,
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
  rmSync,
} from 'node:fs';
import { resolve, basename, dirname } from 'node:path';

export type Results = {
  [key: string]: string | Results;
};

const LOCALE_DIR = './locales' as const;
const PUBLIC_DIR = './public' as const;
const PUBLIC_LOCALE_DIR = `${PUBLIC_DIR}/locales` as const;

/**
 * Writes a JSON file from a YAML file.
 * @param path The path to the directory to write the file to.
 * @param name The name of the file to write without extension.
 * @param yamlPath The path to the YAML file to read.
 */
const writeJsonFileFromYaml = (path: string, name: string, yamlPath: string) => {
  const fileName = `${name}.json`;

  try {
    const fileContent = load(readFileSync(yamlPath, 'utf8'));
    const filePath = resolve(path, fileName);

    writeFileSync(filePath, JSON.stringify(fileContent ?? {}));

    console.info(`Successfully wrote file "${filePath}".`);
  } catch (e) {
    console.error(`Failed to parse file "${yamlPath}" :`, e);
  }
};

/**
 * Creates the corresponding directory of the given path.
 * @param path The path of the created directory.
 * @param dir The directory to create the corresponding directory in.
 */
const createCorrespondingDir = (path: string, dir: string) => {
  const fullPath = resolve(dir, path);

  try {
    mkdirSync(fullPath, { recursive: true });

    console.info(`Successfully created directory "${fullPath}".`);
  } catch (e) {
    console.error(`Failed to create directory "${fullPath}" :`, e);
  }
};

/**
 * Deletes the corresponding JSON file/folder of the given path.
 * @param path The path of the deleted file.
 * @param dir The directory to delete the corresponding JSON file/folder from.
 * @param isDir Whether the deleted file is a directory or not.
 */
const deleteCorrespondingJsonFileOrFolder = (path: string, dir: string, isDir = false) => {
  const fileDir = resolve(dir, dirname(path));
  let fullPath = fileDir;

  if (!isDir) {
    fullPath = resolve(fileDir, `${basename(path, '.yaml')}.json`);
  }

  try {
    if (isDir) {
      rmSync(fullPath, { recursive: true, force: true });
    } else {
      unlinkSync(fullPath);
    }

    console.info(`Successfully deleted ${isDir ? 'directory' : 'file'} "${fullPath}".`);
  } catch (error) {
    console.error(`Failed to delete ${isDir ? 'directory' : 'file'} "${fullPath}" :`, error);
  }
};

/**
 * Walks a directory and returns its tree in the form of an object.
 * @param dir The directory to walk.
 * @returns The directory tree in the form of an object.
 */
const walkDir = (dir: string): Results => {
  const files = readdirSync(dir);
  const result: Results = {};

  for (const file of files) {
    const path = resolve(dir, file);
    const fileInfo = lstatSync(path);

    if (fileInfo.isDirectory()) {
      result[basename(path)] = walkDir(path);
    } else if (path.endsWith('.yaml')) {
      result[basename(path, '.yaml')] = path;
    }
  }

  return result;
};

/**
 * Writes the given results to the given directory.
 * @param results The results to write.
 * @param dir The directory to write the results to.
 */
const writeResults = (results: Results, dir: string) => {
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory "${dir}" :`, error);
    }
  }

  const resultEntries = Object.entries(results);

  for (const [key, result] of resultEntries) {
    if (typeof result === 'string') {
      writeJsonFileFromYaml(dir, key, result);
    } else {
      writeResults(result, resolve(dir, key));
    }
  }
};

const initWatcher = (dir: string) => {
  const watcher = chokidar.watch(dir, {
    persistent: true,
    alwaysStat: true,
  });

  watcher
    .on('add', (path) => {
      writeJsonFileFromYaml(
        resolve(PUBLIC_DIR, dirname(path)),
        basename(path, '.yaml'),
        resolve(path),
      );
    })
    .on('change', (path) => {
      writeJsonFileFromYaml(
        resolve(PUBLIC_DIR, dirname(path)),
        basename(path, '.yaml'),
        resolve(path),
      );
    })
    .on('unlink', (path) => {
      deleteCorrespondingJsonFileOrFolder(path, PUBLIC_DIR);
    })
    .on('addDir', (path) => {
      createCorrespondingDir(path, PUBLIC_DIR);
    })
    // TODO this event is not triggered (not really a problem though)
    .on('unlinkDir', (path) => {
      deleteCorrespondingJsonFileOrFolder(path, PUBLIC_DIR, true);
    })
    .on('error', (error) => {
      console.error('Watcher error :', error);
    });
};

const useWatcher = process.argv.includes('--watch');

if (useWatcher) {
  initWatcher(LOCALE_DIR);
} else {
  const results = walkDir(LOCALE_DIR);

  writeResults(results, PUBLIC_LOCALE_DIR);
}
