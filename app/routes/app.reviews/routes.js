import { index, route } from "@react-router/dev/routes";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routeGroupName = path.basename(__dirname);
const routesDirectory = `routes/${routeGroupName}/routes`;
const routesFolderPath = path.join(__dirname, "routes");
const ROUTE_EXTENSION_PATTERN = /\.(jsx|js|tsx|ts)$/;
const ROUTE_SEGMENT_PATTERN = String.raw`(?:[a-z0-9-]+|\$[A-Za-z_][A-Za-z0-9_]*)`;
const ROUTE_FOLDER_PATTERN = new RegExp(
  `^app\\.${ROUTE_SEGMENT_PATTERN}(?:\\.${ROUTE_SEGMENT_PATTERN})*$`,
);
const ROUTE_FILE_PATTERN =
  new RegExp(
    `^app\\.(?:_index|index|${ROUTE_SEGMENT_PATTERN}(?:\\.${ROUTE_SEGMENT_PATTERN})*)\\.(jsx|js|tsx|ts)$`,
  );

if (!fs.existsSync(routesFolderPath)) {
  throw new Error(`Routes folder not found: ${routesFolderPath}`);
}

if (!routeGroupName.startsWith("app.")) {
  throw new Error(`Route group folder must start with "app.": ${routeGroupName}`);
}

const toUrlSegments = (routeName) =>
  routeName
    .replace(/^app\./, "")
    .split(".")
    .map((segment) =>
      segment.startsWith("$") ? `:${segment.slice(1)}` : segment,
    );

const routeFiles = [];

const collectRouteFiles = (directory, routePrefix = [], filePrefix = []) => {
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ROUTE_FOLDER_PATTERN.test(entry.name)) {
        continue;
      }

      collectRouteFiles(
        path.join(directory, entry.name),
        [...routePrefix, ...toUrlSegments(entry.name)],
        [...filePrefix, entry.name],
      );
      continue;
    }

    if (!entry.isFile() || !ROUTE_FILE_PATTERN.test(entry.name)) {
      continue;
    }

    routeFiles.push({
      file: entry.name,
      filePrefix,
      routePrefix,
    });
  }
};

collectRouteFiles(routesFolderPath);

const routeConflicts = new Map();
const routes = routeFiles.map(({ file, filePrefix, routePrefix }) => {
  const routeName = file.replace(ROUTE_EXTENSION_PATTERN, "");
  const filePath = `${routesDirectory}/${[...filePrefix, file].join("/")}`;
  const isIndexRoute = routeName === "app._index" || routeName === "app.index";

  const urlPath = [
    ...routePrefix,
    ...(isIndexRoute ? [] : toUrlSegments(routeName)),
  ].join("/");

  const routeKey = isIndexRoute && routePrefix.length === 0 ? "?index" : urlPath;
  const conflict = routeConflicts.get(routeKey);
  if (conflict) {
    throw new Error(
      `Duplicate route path "${urlPath}" for "${conflict}" and "${filePath}".`,
    );
  }

  routeConflicts.set(routeKey, filePath);

  if (isIndexRoute && routePrefix.length === 0) {
    return index(filePath);
  }

  return route(urlPath, filePath);
});

export default routes;
