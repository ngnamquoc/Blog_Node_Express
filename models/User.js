import mongoose from "mongoose";

//Step 1: Define schema, containing the structures and data types
const userSchema=mongoose.Schema({
    username:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
        unique:true
    },
   
});
//Step 2: Construct model from schema
const User = mongoose.model('User',userSchema);

export default User;
