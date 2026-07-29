import { authenticate } from "../../shopify.server";
import { singleReviewController } from "./singleReview.controller";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.public.appProxy(request);

  return await singleReviewController.controller(
    request,
    session,
    admin,
    params,
  );
}

// export async function action({ request, params }) {
//   const { admin, session } = await authenticate.public.appProxy(request);

//   return;
// }
