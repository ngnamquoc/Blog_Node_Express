import mongoose from "mongoose";

//Write Schema
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

module.exports = mongoose.model('Post',postSchema);
