import { useOutlet } from "react-router";
import Requests from "./routes/app._index.jsx";

export async function loader() {
  console.log("Loader for requests root route");
  return null;
}

export default function RequestsRoot() {
  const outlet = useOutlet();
  return (
    <>
      {
        outlet ?? <Requests />
      }
    </>
  )
}
