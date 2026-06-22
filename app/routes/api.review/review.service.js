import { uploadFile } from "../../lib/uploadFile"
import { isFileLike } from "../../utils/isFileLike"
async function postReview(request) {
  try {
    const formData = await request.formData();

    const files = [
      ...formData.getAll("media"),
      ...formData.getAll("files"),
    ].filter(isFileLike);

    const uploadedUrls = [];

    for (const file of files) {
      if (!file.size) continue;
      const uploaded = await uploadFile(file);
      uploadedUrls.push(uploaded);
    }

    return { success: true, urls: uploadedUrls };
  } catch (err) {
    console.error("Review media upload failed", err);
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Review media upload failed",
      urls: [],
    };
  }

}
export const reviewService = {
  postReview,
};
