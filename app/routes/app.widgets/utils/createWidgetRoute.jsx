import { useOutlet } from "react-router";

export async function widgetRouteLoader() {
  return null;
}

/**
 * @param {React.ComponentType} IndexComponent
 */
export function createWidgetRoute(IndexComponent) {
  return function WidgetRoute() {
    const outlet = useOutlet();
    return outlet ?? <IndexComponent />;
  };
}
