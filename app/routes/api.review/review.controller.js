import { reviewService } from "./review.service";
async function controller(request, session, admin) {
  switch (request.method) {
    case "POST":
      return await reviewService.postReview(request, session, admin);

    case "GET":
      return await reviewService.getReview(request, session, admin);

    default:
      return { success: false, message: "Method not allowed" };
  }
}

export const reviewController = {
  controller,
};
