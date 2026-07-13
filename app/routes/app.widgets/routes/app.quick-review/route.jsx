import Index from "./routes/app._index.jsx";
import {
  createWidgetRoute,
  widgetRouteLoader,
} from "../../utils/createWidgetRoute.jsx";

export { widgetRouteLoader as loader };
export default createWidgetRoute(Index);
