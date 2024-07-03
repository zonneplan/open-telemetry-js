import { Tree, updateJson } from '@nx/devkit';
import { getNpmPackageVersion } from '@nx/workspace/src/generators/utils/get-npm-package-version';

type PackageName = 'open-telemetry-nest' | 'open-telemetry-zonneplan' | 'open-telemetry-node';

// x -> y means y depends on x
const PackageDependencyMap: Record<PackageName, PackageName[]> = {
  'open-telemetry-nest': ['open-telemetry-zonneplan'],
  'open-telemetry-zonneplan': [],
  'open-telemetry-node': ['open-telemetry-nest', 'open-telemetry-zonneplan']
};

function getPackagePath(packageName: PackageName) {
  return `packages/${packageName}/package.json`;
}

function getPackageIdentifier(packageName: PackageName) {
  return `@zonneplan/${packageName}`;
}

export async function syncGenerator(tree: Tree) {
  Object.keys(PackageDependencyMap).forEach((packageName) => syncDepdendencyForPackage(tree, packageName as PackageName));
}

function syncDepdendencyForPackage(tree: Tree, packageName: PackageName) {
  const dependantPackages = PackageDependencyMap[packageName];

  if (!dependantPackages.length) {
    console.log(`No dependant packages found for ${packageName}`);
    return;
  }


  const packageIdentifier = getPackageIdentifier(packageName);
  const currentVersion = getNpmPackageVersion(packageIdentifier);

  if (!currentVersion) {
    console.error(`Could not find version for ${packageIdentifier}`);
    return;
  }

  console.log(`Updating ${packageIdentifier} to ${currentVersion}`);
  for (const dependantPackage of dependantPackages) {
    updateJson(tree, getPackagePath(dependantPackage), (json) => {
      json.dependencies ??= {};
      json.dependencies[packageIdentifier] = `^${currentVersion}`;

      return json;
    });

  }
}

export default syncGenerator;
