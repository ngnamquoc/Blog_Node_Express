import dotenv from "dotenv";
import express from "express";
import expressLayout from "express-ejs-layouts";

import connectDB from "./config/db.js";

const app=express();
const port=4000 || process.env.PORT;

// Load environment variables from .env file
dotenv.config();

//Connect to DB
connectDB();

//set the static directory
app.use(express.static("public"));

//Set template engine
app.use(expressLayout);
app.set('view engine','ejs');

//set the main layout path
app.set('layout','./layout/main');

//routes
app.get("/",(req,res)=>{
    const locals={
        "title":"Node Js Blog",
        "description":"This is a simple blog created with NodeJs, Express and Postgre.",
    }
    res.render('index',{locals});
});
app.get("/about",(req,res)=>{
    res.render('about');
});

app.listen(port, ()=>{
    console.log(`Server is running at ${port}...`);
})