
import express from "express";
import dotenv from 'dotenv';
import connectDB from "./db/index.js";


const app = express();

dotenv.config({
  path: "./env"
})

connectDB().then(() => {
  app.listen((process.env.PORT || 8000, () => {
    console.log(`Server is running on ${process.env.PORT}`);
  }))
}).catch(err => {
  console.log("mongodb connected fail!!", err);
})

/*(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.error("Error: ", error);
      throw error
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
})()
  */