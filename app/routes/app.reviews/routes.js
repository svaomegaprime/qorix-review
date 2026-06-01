import { index, route } from "@react-router/dev/routes";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const routesDirectory = "routes/app.reviews/routes";

const routesFolderPath = path.join(__dirname, "routes");

// Read all route files dynamically
const routeFiles = fs.readdirSync(routesFolderPath)
  .filter(file => file.endsWith(".jsx") )
  .sort();

// Map files to routes
const routes = routeFiles.map(file => {
  const URL = file.replace(/\.(jsx)$/, "");
  
  if (URL === "index") {
    return index(`${routesDirectory}/index.jsx`);
  }
  
  return route(URL, `${routesDirectory}/${file}`);
});

export default routes;
