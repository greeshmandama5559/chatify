// cloudinary.js
import { v2 as cloudinaryImage } from "cloudinary";
import ENV from "../ENV.js";

if (!ENV.CLOUDINARY_CLOUD_NAME_IMAGE || !ENV.CLOUDINARY_API_KEY_IMAGE || !ENV.CLOUDINARY_API_SECRET_IMAGE) {
    console.error(
        "Missing Cloudinary configuration. Make sure CLOUDINARY_CLOUD_NAME_IMAGE, CLOUDINARY_API_KEY_IMAGE and CLOUDINARY_API_SECRET_IMAGE are set."
    );
    // optional: throw to stop startup so you notice immediately
    // throw new Error("Missing Cloudinary configuration");
}

cloudinaryImage.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME_IMAGE,
    api_key: ENV.CLOUDINARY_API_KEY_IMAGE,
    api_secret: ENV.CLOUDINARY_API_SECRET_IMAGE,
});

export default cloudinaryImage;
