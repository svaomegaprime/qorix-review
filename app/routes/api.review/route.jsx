import { authenticate } from "../../shopify.server";
import { reviewController } from "./review.controller";

export async function loader({ request }) {
  await authenticate.public.appProxy(request);
  return { ok: true };
}

export async function action({ request }) {
  await authenticate.public.appProxy(request);

  return await reviewController.postReview(request);
}
