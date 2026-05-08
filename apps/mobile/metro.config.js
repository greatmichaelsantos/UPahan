const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Block root-level React so every import resolves to apps/mobile/node_modules/react.
// extraNodeModules is only a fallback; packages in root/node_modules find root React
// via normal upward lookup first, causing two React instances and useState crashes.
// blockList prevents Metro from bundling root React at all.
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const rootReact = path.join(workspaceRoot, 'node_modules', 'react');
config.resolver.blockList = new RegExp(`^${escapeRegExp(rootReact)}[/\\\\].*`);

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
