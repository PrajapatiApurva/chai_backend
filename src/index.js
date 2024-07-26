// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "../.env"
});

const PORT = process.env.PORT || 3000;

connectDB()
.then(() => { 
    app.on("error", (error)=>{
        console.log("Error: ",error);
        throw error
    });
    app.listen(PORT, ()=>{
        console.log(`Server running on http://localhost:${PORT}`);
    })
    
})
.catch((error) => {
    console.log("Error on DATABASE CONNECTION: ",error);
})















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
