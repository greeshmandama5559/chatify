import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("DataBase Connection Successfull "+conn.connection.host);
    } catch (error) {
        console.error("An error occured while connecting the database: "+ error);
        process.exit(1) //1 is failes and 0 is success.
    }
}