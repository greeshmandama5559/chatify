import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    RESEND_API_KEY: process.env.RESEND_APIKEY,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL
}

export default ENV;