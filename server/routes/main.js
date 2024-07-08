import express from "express";
const router = express.Router();

//Routes
router.get("/",(req,res)=>{
    res.send("hello");
})

module.exports = router;