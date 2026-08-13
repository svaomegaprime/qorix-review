import { authenticate } from "../../shopify.server";
import { reviewController } from "./review.controller";

export async function loader({ request }) {
  const { admin, session } = await authenticate.public.appProxy(request);
  const data = await reviewController.controller(request, session, admin);

  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

export async function action({ request }) {
  const { admin, session } = await authenticate.public.appProxy(request);
  const data = await reviewController.controller(request, session, admin);

  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
