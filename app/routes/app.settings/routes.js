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
const ROUTE_MODULE_FILE_NAMES = ["route.jsx", "route.js", "route.tsx", "route.ts"];

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

const toRouteFilePath = (fileParts) =>
  `${routesDirectory}/${fileParts.join("/")}`;

const getRouteModuleFile = (directory) =>
  ROUTE_MODULE_FILE_NAMES.find((fileName) =>
    fs.existsSync(path.join(directory, fileName)),
  );

const addRoute = ({
  routes,
  routeConflicts,
  urlPath,
  filePath,
  children = [],
  isIndexRoute = false,
}) => {
  const routeKey = isIndexRoute && urlPath === "" ? "?index" : urlPath;
  const conflict = routeConflicts.get(routeKey);

  if (conflict) {
    throw new Error(
      `Duplicate route path "${urlPath}" for "${conflict}" and "${filePath}".`,
    );
  }

  routeConflicts.set(routeKey, filePath);

  if (isIndexRoute && urlPath === "") {
    routes.push(index(filePath));
    return;
  }

  routes.push(
    children.length > 0 ? route(urlPath, filePath, children) : route(urlPath, filePath),
  );
};

const collectRoutes = (
  directory,
  filePrefix = [],
  routePrefix = [],
  routeConflicts = new Map(),
) => {
  const routes = [];
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ROUTE_FOLDER_PATTERN.test(entry.name)) {
        continue;
      }

      const folderPath = path.join(directory, entry.name);
      const folderRoutePrefix = [...routePrefix, ...toUrlSegments(entry.name)];
      const routeModuleFile = getRouteModuleFile(folderPath);

      if (routeModuleFile) {
        const nestedRoutesPath = path.join(folderPath, "routes");
        const children = fs.existsSync(nestedRoutesPath)
          ? collectRoutes(
              nestedRoutesPath,
              [...filePrefix, entry.name, "routes"],
              [],
              new Map(),
            )
          : [];

        addRoute({
          routes,
          routeConflicts,
          urlPath: folderRoutePrefix.join("/"),
          filePath: toRouteFilePath([...filePrefix, entry.name, routeModuleFile]),
          children,
        });
        continue;
      }

      routes.push(
        ...collectRoutes(
          folderPath,
          [...filePrefix, entry.name],
          folderRoutePrefix,
          routeConflicts,
        ),
      );
      continue;
    }

    if (!entry.isFile() || !ROUTE_FILE_PATTERN.test(entry.name)) {
      continue;
    }

    const routeName = entry.name.replace(ROUTE_EXTENSION_PATTERN, "");
    const isIndexRoute = routeName === "app._index" || routeName === "app.index";

    const urlPath = [
      ...routePrefix,
      ...(isIndexRoute ? [] : toUrlSegments(routeName)),
    ].join("/");

    addRoute({
      routes,
      routeConflicts,
      urlPath,
      filePath: toRouteFilePath([...filePrefix, entry.name]),
      isIndexRoute,
    });
  }

  return routes;
};

const routes = collectRoutes(routesFolderPath);

export default routes;
