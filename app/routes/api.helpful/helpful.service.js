import { AppError } from "../../utils/appError.server";

async function createHelpful(request, admin) {
  try {
    return {
      ok: "true",
      data: "attachments",
    };
  } catch (error) {
    console.error("[ERROR::api.review]", error);
    return AppError.handle(error);
  }
}

export const helpfulService = {
  createHelpful,
};
