import imageCompression from "browser-image-compression";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
};

export const uploadProductImage = async (file, folder = "zancart/products") => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  const compressedFile = await imageCompression(file, compressionOptions);

  const uploadData = new FormData();
  uploadData.append("file", compressedFile);
  uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // The preset can define the folder. If the preset permits it,
  // this parameter organizes uploads into the requested folder.
  if (folder) {
    uploadData.append("folder", folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: uploadData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Cloudinary image upload failed."
    );
  }

  if (!result.secure_url) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return result.secure_url;
};