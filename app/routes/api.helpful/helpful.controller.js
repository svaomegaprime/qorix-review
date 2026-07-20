import { helpfulService } from "./helpful.service";
async function controller(request, admin) {
  switch (request.method) {
    case "POST":
      return await helpfulService.createHelpful(request, admin);

    case "GET":
      return;

    default:
      return { success: false, message: "Method not allowed" };
  }
}

export const reviewController = {
  controller,
};
