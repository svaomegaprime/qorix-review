import { reviewService } from "./review.service";
async function controller(request, admin) {
  switch (request.method) {
    case "POST":
      return await reviewService.postReview(request, admin);

    case "GET":
      return await reviewService.getReview(request, admin);

    default:
      return { success: false, message: "Method not allowed" };
  }
}

export const reviewController = {
  controller,
};
