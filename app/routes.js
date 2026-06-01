import { flatRoutes } from "@react-router/fs-routes";
import reviewRoutes from "./routes/app.reviews/routes.js";

const routes = await flatRoutes();

const appRoute = routes.find((route) => route.file === "routes/app.jsx");
const reviewsRoute = appRoute?.children?.find(
  (route) => route.file === "routes/app.reviews/route.jsx",
);

if (reviewsRoute) {
  reviewsRoute.children = reviewRoutes;
}

export default routes;
