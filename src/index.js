// require("dotenv").config({ path: "./env" });

import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";

dotenv.config({
  path: "./env",
});

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//     app.on("error", (error) => {
//       console.log("Error with express : ", error);
//       throw err;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port : ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Error: ", error);
//     throw err;
//   }
// })();
