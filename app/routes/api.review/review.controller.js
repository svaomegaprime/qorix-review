import { reviewService } from "./review.service";
async function postReview(request) {
  switch (request.method) {
    case "POST":
      return await reviewService.postReview(request);

    default:
      return { success: false, message: "Method not allowed" };
  }
}

export const reviewController = {
  postReview,
};
