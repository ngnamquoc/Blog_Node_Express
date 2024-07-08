import dotenv from "dotenv";
import express from "express";
import expressLayout from "express-ejs-layouts";

const app=express();
const port=4000 || process.env.PORT;

//set the static directory
app.use(express.static("public"));

//Set template
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

//routes
app.get("/",(req,res)=>{
    res.send("Hello");
});

app.listen(port, ()=>{
    console.log(`Server is running at ${port}...`);
})