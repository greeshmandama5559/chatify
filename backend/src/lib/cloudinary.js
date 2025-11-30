// cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import ENV from "../ENV.js";

if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_API_SECRET) {
  console.error(
    "Missing Cloudinary configuration. Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set."
  );
  // optional: throw to stop startup so you notice immediately
  // throw new Error("Missing Cloudinary configuration");
}

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET, // <-- fixed typo here
});

export default cloudinary;
