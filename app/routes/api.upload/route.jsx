import { authenticate } from "../../shopify.server";
import { reviewController } from "./upload.controller";

// export async function loader({ request }) {
//   // const { admin } = await authenticate.public.appProxy(request);
//   return {}
//   return await reviewController.controller(request, admin);
// }

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  console.log(admin);

  
  return await reviewController.controller(request, admin);
}
