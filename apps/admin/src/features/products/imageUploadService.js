import api from "@/services/api";
import imageCompression from "browser-image-compression";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
};

export const uploadProductImage = async (file) => {
  if (!AUTH_API_URL) {
    throw new Error("VITE_AUTH_API_URL is not configured.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not a valid image.`);
  }

  // Compress the image before uploading.
  const compressedFile = await imageCompression(
    file,
    compressionOptions
  );

  // Ask the authenticated Express backend to sign the upload.
  const signatureResponse = await api.post(
    `${AUTH_API_URL}/api/admin/uploads/signature`
  );

  const {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  } = signatureResponse.data.upload;

  // Upload directly to Cloudinary.
  const uploadData = new FormData();
  uploadData.append("file", compressedFile);
  uploadData.append("api_key", apiKey);
  uploadData.append("timestamp", String(timestamp));
  uploadData.append("folder", folder);
  uploadData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Image upload failed."
    );
  }

  return result.secure_url;
};