import { authenticate } from "../../shopify.server";
import { reviewController } from "./review.controller";

export async function loader({ request }) {
  const { admin } = await authenticate.public.appProxy(request);

  return await reviewController.controller(request, admin);
}

export async function action({ request }) {
  const { admin } = await authenticate.public.appProxy(request);

  return await reviewController.controller(request, admin);
}
