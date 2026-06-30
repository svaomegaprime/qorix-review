import { uploadFile } from "../../lib/uploadFile"
import { isFileLike } from "../../utils/isFileLike"
import { AppError } from "../../utils/appError.server"

async function upload(request, admin) {
  try {
    // const { id } = await getStoreData(admin);
    const formData = await request.formData();

    const files = [
      ...formData.getAll("media"),
      ...formData.getAll("files"),
      ...formData.getAll("logoFile"),
    ].filter(isFileLike);

    const uploadedData = [];

    for (const file of files) {
      if (!file.size) continue;
      const uploaded = await uploadFile(file);
      console.log(uploaded);
      uploadedData.push(uploaded);
    }

    const attachments = uploadedData.map((item) => {
      return {
        type: item.type.startsWith("video/")
          ? "VIDEO"
          : "IMAGE",
        url: item.url
      };
    });

    return {
      ok: true,
      data: attachments,
    };
  } catch (error) {
    console.error("[ERROR::api.review]", error);
    return AppError.handle(error);
  }
}

export const reviewService = {
  upload,
};
