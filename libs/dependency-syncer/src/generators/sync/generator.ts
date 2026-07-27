import { readJson, Tree, updateJson } from '@nx/devkit';

type PackageName =
  'open-telemetry-nest' | 'open-telemetry-zonneplan' | 'open-telemetry-node';

// x -> y means y depends on x
const PackageDependencyMap: Record<PackageName, PackageName[]> = {
  'open-telemetry-nest': ['open-telemetry-zonneplan'],
  'open-telemetry-zonneplan': [],
  'open-telemetry-node': ['open-telemetry-nest', 'open-telemetry-zonneplan'],
};

function getPackagePath(packageName: PackageName) {
  return `packages/${packageName}/package.json`;
}

function getPackageIdentifier(packageName: PackageName) {
  return `@zonneplan/${packageName}`;
}

export async function syncGenerator(tree: Tree) {
  Object.keys(PackageDependencyMap).forEach((packageName) =>
    syncDepdendencyForPackage(tree, packageName as PackageName),
  );
}

function syncDepdendencyForPackage(tree: Tree, packageName: PackageName) {
  const dependantPackages = PackageDependencyMap[packageName];

  if (!dependantPackages.length) {
    console.log(`No dependant packages found for ${packageName}`);
    return;
  }

  const packageIdentifier = getPackageIdentifier(packageName);
  const packagePath = getPackagePath(packageName);
  // readJson throws on a missing file; skip so one moved package cannot abort
  // the release halfway, with versions bumped but ranges left unsynced.
  const currentVersion = tree.exists(packagePath)
    ? readJson(tree, packagePath).version
    : undefined;

  if (!currentVersion) {
    console.error(`Could not find version for ${packageIdentifier}`);
    return;
  }

  console.log(`Updating ${packageIdentifier} to ${currentVersion}`);
  for (const dependantPackage of dependantPackages) {
    const dependantPath = getPackagePath(dependantPackage);

    if (!tree.exists(dependantPath)) {
      console.error(`Could not find ${dependantPath}, skipping`);
      continue;
    }

    updateJson(tree, dependantPath, (json) => {
      json.dependencies ??= {};
      json.dependencies[packageIdentifier] = `^${currentVersion}`;

      return json;
    });
  }
}

export default syncGenerator;
