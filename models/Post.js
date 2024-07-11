import mongoose from "mongoose";

//Step 1: Define schema, containing the structures and data types
const postSchema=mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    body:{
        type:String,
        require:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        require:true
    },
    updatedAt:{
        type:Date,
        default:Date.now(),
        require:true
    }
});
//Step 2: Construct model from schema
const Post = mongoose.model('Post',postSchema);

export default Post;
