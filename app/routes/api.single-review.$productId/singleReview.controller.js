import { singleReviewService } from "./singleReview.service";

async function controller(request, session, admin, params) {
  switch (request.method) {
    case "GET":
      return await singleReviewService.getSingleReview(request, admin, params);
    // case "POST":
    // return await singleReviewService.postReview(request, session, admin, params);
    default:
      return { success: false, message: "Method not allowed" };
  }
}

export const singleReviewController = {
  controller,
};
