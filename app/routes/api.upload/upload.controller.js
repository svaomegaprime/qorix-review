import { reviewService } from "./upload.service";
async function controller(request, admin) {
  switch (request.method) {
    case "POST":
      return await reviewService.upload(request, admin);

    case "GET":
      return ;

    default:
      return { success: false, message: "Method not allowed" };
  }
}

export const reviewController = {
  controller,
};
