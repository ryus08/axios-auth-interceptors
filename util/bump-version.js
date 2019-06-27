#!/usr/bin/env node
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const semver = require('semver');

const package = require(`${process.cwd()}/package.json`);

const packageName = package.name;
const packageVersion = package.version;
console.log(`package version of ${packageVersion}: ${packageName}`);
const packageMajorMinor = `${semver.major(packageVersion)}.${semver.minor(packageVersion)}`;
let viewCommand = `npm view ${packageName}@${packageMajorMinor} version --json`;
if (package.publishConfig) {
  viewCommand += ` --registry=${package.publishConfig.registry}`;
}

async function run() {
  try {
    let versions = await exec(viewCommand);
    let gitTag;
    if (versions && versions.stdout) {
      versions = JSON.parse(versions.stdout);
      if (!Array.isArray(versions)) {
        versions = [versions];
      }
      const latestVersion = semver.maxSatisfying(versions, '*');
      console.log(`latest published version: ${latestVersion}`);
      const newVersion = semver.inc(latestVersion, 'patch');
      console.log(`version to publish: ${newVersion}`);
      gitTag = await exec(`npm --allow-same-version --no-git-tag-version version ${newVersion}`);
    } else {
      console.log('no published version, using package version');
      gitTag = await exec(`npm --allow-same-version --no-git-tag-version version ${packageVersion}`);
    }
    gitTag = gitTag.stdout.trim();
    await exec(`echo ${gitTag} > .git-tag`);
    console.log(`${gitTag} written to .git-tag`);

    return gitTag;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

run();
