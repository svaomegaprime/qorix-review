import { useOutlet } from "react-router";
import Reviews from "./routes/app._index.jsx";

export async function loader() {
  console.log("Loader for reviews root route");
  return null;
}

export default function ReviewsRoot() {
  const outlet = useOutlet();
  return (
    <>
      {
        outlet ?? <Reviews />
      }
    </>
  )
}
