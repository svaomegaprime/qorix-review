import { useOutlet } from "react-router";
import Widgets from "./routes/app._index.jsx";

export async function loader() {
  console.log("Loader for widgets root route");
  return null;
}

export default function WidgetsRoot() {
  const outlet = useOutlet();
  return (
    <>
      {
        outlet ?? <Widgets />
      }
    </>
  )
}
