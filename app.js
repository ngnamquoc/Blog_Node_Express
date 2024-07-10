import dotenv from "dotenv";
import express from "express";
import expressLayout from "express-ejs-layouts";

import connectDB from "./config/db.js";
import Post from "./models/Post.js"

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
// HomePage - GET
app.get('/', async (req, res) => {
    try {
      const locals = {
        title: "NodeJs Blog",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      let perPage = 10;
      //get the current page number from url
      let page = req.query.page || 1;
  
      const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
  
      const count = await Post.countDocuments({});
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);
  
      res.render('index', { 
        locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        currentRoute: '/'
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });
// app.get("/", async(req,res)=>{
//     const locals={
//         "title":"Node Js Blog",
//         "description":"This is a simple blog created with NodeJs, Express and MongoDB.",
//     }
//     try{
//         //await the app to fetch all the posts from DB
//         const data=await Post.find();
//         res.render('index',{locals, data});

//     }catch(e){
//         console.log(e);

//     }
// });

// function insertPostData(){
//     Post.insertMany([
//         {
//             title:"Building a Blog",
//             body:"This is the body text"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },
//         {
//             title:"Building a Blog 2",
//             body:"This is the body text 2"
//         },

       
//     ])
// }
// // insert into DB
// insertPostData();

app.get("/about",(req,res)=>{
    res.render('about');
});
app.get("/contact",(req,res)=>{
    res.render('contact');
});

app.listen(port, ()=>{
    console.log(`Server is running at ${port}...`);
})