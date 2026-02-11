// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: './env'
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);

    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!!", err);
})



//  app.use ap tab use karo ga jab apko koi middleware ya fir koi configuration setting karni hogi



/*            This is the first approach
 import express from "express";
const app = express()
// iife-semicolon (;) at starting is for the cleaning purpose means if developer forget a semicolon in a upper code
 ( async () => { 
         try{
            await mongoose.connect(`${process.env.MANGODB_URI}/${DB_NAME}`)
            app.on("error", (error) => {
                console.log("ERROR:", error);
                throw error
            })

            app.listen(process.env.PORT, () =>{
                console.log(`App is listening on  port ${process.env.PORT}`);
            })

         } catch (error) {
            console.error("ERROR:", error)
            throw err
         }
 })() 
         
 */