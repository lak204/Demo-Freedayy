import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
const CLOUDINARY_API_KEY = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET =
  process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || "";
const CLOUDINARY_UPLOAD_PRESET = "freeday_uploads"; // Create this in your Cloudinary console

class CloudinaryService {
  // Pick an image from the device
  async pickImage() {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new Error("We need camera roll permissions to upload images");
    }

    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }

    return null;
  }

  // Upload image to Cloudinary
  async uploadImage(imageUri: string, folder = "freeday_app") {
    try {
      console.log("🚀 Uploading image to Cloudinary...");

      // Create form data for the upload
      const formData = new FormData();

      // Add the image file
      const filename = imageUri.split("/").pop() || "upload.jpg";
      const fileType = filename.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = fileType === "png" ? "image/png" : "image/jpeg";

      // @ts-ignore - FormData type definitions are not perfect
      formData.append("file", {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        type: mimeType,
        name: filename,
      });

      // Add upload parameters
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folder);
      formData.append("api_key", CLOUDINARY_API_KEY);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const responseData = await response.json();
      console.log("✅ Image uploaded successfully:", responseData.secure_url);

      return {
        url: responseData.secure_url,
        publicId: responseData.public_id,
      };
    } catch (error) {
      console.error("❌ Failed to upload image:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  // Delete an image from Cloudinary
  async deleteImage(publicId: string) {
    try {
      console.log("🗑️ Deleting image from Cloudinary:", publicId);

      // Create timestamp and signature for authenticated requests
      const timestamp = Math.floor(Date.now() / 1000);

      // You would need to implement the signature generation on your backend for security
      // DO NOT do this on the frontend as it would expose your API secret
      // This is just a placeholder - implement the actual deletion through your backend API

      console.log(
        "⚠️ Image deletion should be handled by the backend for security reasons"
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to delete image:", error);
      throw new Error("Failed to delete image from Cloudinary");
    }
  }
}

export const cloudinaryService = new CloudinaryService();
