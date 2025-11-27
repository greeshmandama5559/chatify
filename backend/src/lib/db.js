import mongoose from 'mongoose';
import ENV from '../ENV.js'

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log("DataBase Connection Successfull "+conn.connection.host);
    } catch (error) {
        console.error("An error occured while connecting the database: "+ error);
        process.exit(1) //1 is failes and 0 is success.
    }
}