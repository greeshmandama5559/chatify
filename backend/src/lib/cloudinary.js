import { v2 as cloudirany } from 'cloudinary';
import ENV from '../ENV.js';

cloudirany.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_serect: ENV.CLOUDINARY_API_SECRET
});

export default cloudirany;