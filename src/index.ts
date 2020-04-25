import fs from "fs";
import npmConf from "npm-conf";
import path from "path";
import semver from "semver";
import { getJSON } from "./utils";

const regex = /^(?:>=|[\^~>])\d+(.\d+)?(.\d+)?(-\w+\.\d+)?$/;
const dirname = process.cwd().split(path.sep).pop();

const registry = (() => {
  const result = npmConf().get("registry");
  return result.endsWith("/") ? result : result + "/";
})();

const getRegistryMetadata = async (name: string) => {
  const url = registry + name;
  return getJSON(url);
};

const getLatestVersion = async (name: string, range: string) => {
  const metadata = await getRegistryMetadata(name);
  const versions = Object.keys(metadata.versions).filter((version) =>
    semver.satisfies(version, range)
  );
  const latest = versions.sort(semver.compare).pop();
  return latest;
};

const checkDependency = async (deps: Record<string, string>, dep: string) => {
  const range = deps[dep];
  if (!regex.test(range)) {
    return;
  }

  try {
    const latest = await getLatestVersion(dep, range);
    const symbol = /^([^\d]*)/.exec(range)![1] || "";
    const next = `${symbol}${latest}`;
    if (range !== next) {
      console.log([dirname, dep, range, next].join());
    }
    deps[dep] = next;
  } catch (e) {
    // do nothing
  }
};

const checkDependencies = async (deps: Record<string, string> = {}) => {
  const promises: Promise<void>[] = [];
  for (const dep in deps) {
    promises.push(checkDependency(deps, dep));
  }
  return Promise.all(promises);
};

const write = async (filePath: string, obj: any) => {
  const pkg = await fs.promises.readFile(filePath, "utf8");
  const space = /\{\n?(?<space>[^"]+)"/.exec(pkg)!.groups!.space;
  const content = JSON.stringify(obj, null, space) + "\n";
  return fs.promises.writeFile(filePath, content);
};

export default async () => {
  const filePath = path.resolve(process.cwd(), "package.json");
  const pkg = require(filePath);
  await Promise.all([
    checkDependencies(pkg.dependencies),
    checkDependencies(pkg.devDependencies),
  ]);
  await write(filePath, pkg);
};
