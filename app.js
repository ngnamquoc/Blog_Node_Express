import dotenv from "dotenv";
import express from "express";
import expressLayout from "express-ejs-layouts";
import bodyParser from "body-parser";

import connectDB from "./config/db.js";
import Post from "./models/Post.js"
import User from "./models/User.js"

const app=express();
const port=4000 || process.env.PORT;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());


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
      let perPage = 10;  //number of blog posts display per page
      let page = req.query.page || 1;  //retrieves the page query parameter from the URL, or defaults to 1 if the parameter is not present


      //documentation:https://mongoosejs.com/docs/api/aggregate.html#Aggregate()
      //Model.aggregate() used to perform complex data processing
  
      const data = await Post
      .aggregate([ { $sort: { createdAt: -1 } } ]) //sort the post in descending order by createdAt time stamp
      //pagination by skip(), kip a certain number of items depending on the page number:
      // page 1, we skip: 10*1-10=0 first items on the list
      // page 2, we skip: 10*2-10=10 first items on the list
      // page n, we skip: 10*n-10 first items on the list
      .skip(perPage * page - perPage) 
      .limit(perPage) //limit the result to 10 posts per page
      .exec(); //execute the aggregation pipeline and return the result

      //const data will store max 10 records based on current page number
  
      const count = await Post.countDocuments({}); //get the total number of records in "Post" collection
      const maxPageQty=Math.ceil(count / perPage); //calculate the qty of page
      const nextPage = parseInt(page) + 1; //next page index: current page +1
      const hasNextPage = nextPage <= maxPageQty; //boolean value, check if next page number <= max page qty
  
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

// HomePage - GET:post_id
app.get("/post/:id", async(req,res)=>{
    
    try{
      //retrieve post id
      let postId=req.params.id;
      //find the post record by id
      const data=await Post.findById({_id:postId});
      const locals={
        "title":data.title,
        "description":"This is a simple blog created with NodeJs, Express and MongoDB.",
      }
      //pass post detail to view 
      res.render('post',{locals, data});

    }catch(e){
        console.log(e);

    }
});

//Search Route - Post - search terms
app.post('/search', async (req, res) => {
  try {
    const locals = {
      title: "Seach",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    let searchTerm = req.body.searchTerm;
    
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "") //special character will be replaced with ""
    //search inside Post collection
    const data = await Post.find({
      //or logical operator that take array of conditions and return matching records
      $or: [
        //check if the title field matches the search term, 'i' specifies case-insensitive
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
        //check if the body field matches the search term, 'i' specifies case-insensitive
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
      ]
    });

    res.render("search", {
      data,
      locals,
      currentRoute: '/'
    });

  } catch (error) {
    console.log(error);
  }

});

//Admin route-Get
app.get("/admin", async (req, res) => {
  try{
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    //render the admin index ejs file using the admin layout
    res.render('admin/index',{
      locals,
      layout:"../views/layout/admin.ejs"
    });
  }catch(e){
    console.log(e);
  }
})

//Admin route-Post-Check Login
app.post("/admin", async (req, res) => {
  try{
    const {username,password}=req.body;
    if(username ==="admin" && password ==="admin123"){
      res.send("you are logged in");

    }else{
      res.send("wrong username and password");


    }
  
    
   
  }catch(e){
    console.log(e);
  }
})

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