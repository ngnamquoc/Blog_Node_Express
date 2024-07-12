import dotenv from "dotenv";
import express from "express";
import expressLayout from "express-ejs-layouts";
import bodyParser from "body-parser";

import connectDB from "./config/db.js";
import Post from "./models/Post.js"
import User from "./models/User.js"
import cookieParser from "cookie-parser";
import MongoStore from 'connect-mongo';
import session from "express-session";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import methodOverride from "method-override";
import isActiveRoute from "./helpers/routeHelpers.js";

// Load environment variables from .env file
dotenv.config();

const app=express();
const port=4000 || process.env.PORT;

//active route check
app.locals.isActiveRoute=isActiveRoute;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
//set to use methodOverride
app.use(methodOverride('method'));

//Middleware
//Check Login Page
const authMiddleware=(req,res,next)=>{
  // console.log(req);
  const token=req.cookies.token;

  if(!token){
    return res.status(401).json({message:"Unauthorized"})
  }else{
    try{
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      req.userId=decoded.userId;//adds the userId property to the request object
      next();
    }catch(e){
      return res.status(401).json({message:"Unauthorized"})
    }
  }
}

//cookie and session config
app.use(cookieParser()); //Parses the cookies attached to incoming requests. This makes the cookies available under req.cookies.
//session middleware configuration
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
  cookie: { secure: process.env.NODE_ENV==='production' }
}));


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

// AboutPage - GET
app.get("/about",(req,res)=>{
    res.render('about',{
      currentRoute:"/about"
    });
});

// ContactPage - GET
app.get("/contact",(req,res)=>{
    res.render('contact',{
      currentRoute:"/contact"
    });
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
      res.render('post',{
        locals, 
        data,
        currentRoute:`/post/${postId}`
      });

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
    const user=await User.findOne({username});
    if(!user){
      return res.status(401).json({message:"Invalid credentials"})
    }
    const isPasswordValid = await bycrypt.compare(password,user.password);
    if(!isPasswordValid){
      return res.status(401).json({message:"Invalid credentials"})
    }
    //create token for current session
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET);
    res.cookie('token',token,{httpOnly:true});
    
    res.redirect("/dashboard");
   
  }catch(e){
    console.log(e);
  }
})

// GET-Admin Dashboard
app.get("/dashboard",authMiddleware, async (req, res) => {
  try{
    const locals = {
      title: "Admin Dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    const data=await Post.aggregate([ { $sort: { createdAt: -1 } } ]);
    res.render("admin/dashboard",{
      locals,
      data,
      layout: "../views/layout/admin.ejs"

    });
  }catch(e){
    console.log(e);
  }
})

// GET-Admin - Create new post
app.get("/add-post",authMiddleware, async (req, res) => {
  try{
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    const data=await Post.find();
    res.render("admin/add-post",{
      locals,
      data,
      layout: "../views/layout/admin.ejs"
    });
  }catch(e){
    console.log(e);
  }
})

// Post-Admin - Create new post
app.post("/add-post",authMiddleware, async (req, res) => {
  try{

    try{

      const newPost=new Post({
        title:req.body.title,
        body:req.body.body
      })
      await Post.create(newPost);
      res.redirect("/dashboard");


    }catch(e){
      console.log(e);
    }
 
   
  }catch(e){
    console.log(e);
  }
})

// Get-Admin - Edit post
app.get("/edit-post/:id",authMiddleware, async (req, res) => {
  try{
    const locals = {
      title: "Edit Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    //find post with id 
    const data = await Post.findOne({_id:req.params.id});
    // console.log(data);
    res.render('admin/edit-post',{
      data,
      layout: "../views/layout/admin.ejs"
    })
   
  }catch(e){
    console.log(e);
  }
})

// Put-Admin - Edit post
app.put("/edit-post/:id",authMiddleware, async (req, res) => {
  try{
    console.log(req.params.id);
    //find post with id and update
    await Post.findByIdAndUpdate(req.params.id,{
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });
    //redirect to edit post get page
    res.redirect(`/edit-post/${req.params.id}`);
  }catch(e){
    console.log(e);
  }
})

// Delete-Admin - Delete post
app.delete("/delete-post/:id",authMiddleware, async (req, res) => {
  try{
    //find post with id and update
    await Post.deleteOne({_id:req.params.id});
  
    //redirect to dashboard
    res.redirect('/dashboard');
  }catch(e){
    console.log(e);
  }
})

// Get-Admin - Logout
app.get("/logout",async (req, res) => {
  res.clearCookie('token');
  res.redirect('/')
  
})

//Admin register page route-Post
app.post("/register", async (req, res) => {
  try{
    const {username,password}=req.body;
    // console.log(username);
    // console.log(password);
    const hashedPassword=await bycrypt.hash(password,10);

    try{
      const user = User.create({
        username:username,
        password:hashedPassword
      });
      res.status(201).json({message:"User Created...",user})
    }catch(e){
      console.log(e);
      if(e.code===11000){
        res.status(409).json({message:"User already registered!"})
      }else{
        res.status(500).json({message:"Internal Server Error"});
      }

    }
    
  }catch(e){
    console.log(e);
  }
})



app.listen(port, ()=>{
    console.log(`Server is running at ${port}...`);
})