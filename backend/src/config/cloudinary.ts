import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: "donfhvujv",
  api_key: "693915247214541",
  api_secret: "m5O3cLZPUscOdKLrZaUXBSouS8U",
  secure: true,
});

export const uploadImageByPath = async (
  imagePath: string,
  folder?: string
): Promise<UploadApiResponse> => {
  try {
    const options: any = { resource_type: "auto" };
    if (folder) {
      options.folder = folder;
    }
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary by path:", error);
    throw error;
  }
};

export const uploadImageBuffer = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "app_uploads"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName,
        resource_type: "auto",
      },
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (error) {
          console.error("Cloudinary Buffer Upload Error:", error);
          return reject(error);
        }
        if (result) {
          resolve(result);
        } else {
          reject(
            new Error("Cloudinary upload result is undefined for buffer.")
          );
        }
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

export const getImageUrl = (publicId: string, options: any = {}): string => {
  return cloudinary.url(publicId, { ...options, secure: true });
};

export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};
