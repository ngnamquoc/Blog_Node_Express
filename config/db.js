import mongoose from "mongoose";
const connectDB = async () => {
  
  try {
    mongoose.set('strictQuery', false);
    // console.log(process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }

}

export default connectDB;
