import { authenticate } from "../../shopify.server";
import { helpfulController } from "./helpful.controller";

export async function loader({ request }) {
  const { admin } = await authenticate.public.appProxy(request);
  return {};
}

export async function action({ request }) {
  const { admin } = await authenticate.public.appProxy(request);
  return await helpfulController.controller(request, admin);
}
