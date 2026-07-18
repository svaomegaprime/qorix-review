import { useOutlet } from "react-router";
import Requests from "./routes/app._index.jsx";

export async function loader() {
  return null;
}

export default function RequestsRoot() {
  const outlet = useOutlet();
  return <>{outlet ?? <Requests />}</>;
}
