#!/usr/bin/env node
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const semver = require('semver');

const package = require(`${process.cwd()}/package.json`);

let complete = false;
const packageName = package.name;
const packageVersion = package.version;
console.log(`package version of ${packageVersion}: ${packageName}`);
const packageMajorMinor = `${semver.major(packageVersion)}.${semver.minor(packageVersion)}`;
let viewCommand = `npm view ${packageName}@${packageMajorMinor} version --json`;
if (package.publishConfig) {
  viewCommand += ` --registry=${package.publishConfig.registry}`;
}

exec(viewCommand)
  .then((versions) => {
    if (versions) {
      versions = JSON.parse(versions);
      if (!Array.isArray(versions)) {
        versions = [versions];
      }
      const latestVersion = semver.maxSatisfying(versions, '*');
      console.log(`latest published version: ${latestVersion}`);
      const newVersion = semver.inc(latestVersion, 'patch');
      console.log(`version to publish: ${newVersion}`);
      return exec(`npm --allow-same-version --no-git-tag-version version ${newVersion}`);
    }
    console.log('no published version, using package version');
    return exec(`npm --allow-same-version --no-git-tag-version version ${packageVersion}`);
  })
  .then(gitTag => gitTag.trim())
  .tap(gitTag => exec(`echo ${gitTag} > .git-tag`))
  .then(gitTag => console.log(`${gitTag} written to .git-tag`))
  .tap(() => complete = true)
  .catch((e) => {
    console.log(e);
    complete = true;
  });

const wait = () => {
  if (!complete) {
    setTimeout(wait, 1000);
  }
};
wait();
