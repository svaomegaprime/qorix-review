import { useOutlet } from "react-router";
import Index from "./routes/app._index.jsx";

export async function loader() {
  console.log("Loader for review reel root route");
  return null;
}

export default function IndexRoot() {
  const outlet = useOutlet();
  return (
    <>
      {
        outlet ?? <Index />
      }
    </>
  )
}
