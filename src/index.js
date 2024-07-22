// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env"
});
console.time("DB connection Time:");
connectDB();
console.timeLog("DB connection Time:")














/*
import express from "express";
const app = express()

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME  }`)
        app.on("error", (error)=>{
            console.log("Error: ",error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on http://localhost:${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error: ",error);
    }
})()

*/
