import { flatRoutes } from "@react-router/fs-routes";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesFolderPath = path.join(__dirname, "routes");

const routes = await flatRoutes();

const appRoute = routes.find((route) => route.file === "routes/app.jsx");

const routeFileNames = ["route.jsx", "route.js", "route.tsx", "route.ts"];

if (appRoute?.children) {
  const appRouteFolders = fs
    .readdirSync(routesFolderPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^app\.[a-z0-9.-]+$/i.test(name));

  for (const folder of appRouteFolders) {
    const localRoutesFile = path.join(routesFolderPath, folder, "routes.js");

    if (!fs.existsSync(localRoutesFile)) {
      continue;
    }

    const parentRoute = appRoute.children.find((route) =>
      routeFileNames.some(
        (fileName) => route.file === `routes/${folder}/${fileName}`,
      ),
    );

    if (!parentRoute) {
      continue;
    }

    const localRoutesModule = await import(
      /* @vite-ignore */ pathToFileURL(localRoutesFile).href
    );

    parentRoute.children = localRoutesModule.default;
  }
}

export default routes;
