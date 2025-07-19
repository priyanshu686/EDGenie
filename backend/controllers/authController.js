import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register=async(req,res)=>{
    const {name,email,password}=req.body;
    try{
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({error:"User already exists!"})
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            name,email,password:hashedPassword
        })
        res.status(201).json({message:"User registered", user});
    
    }catch{
        res.status(500).json({error:"Something went wrong"})
    }
};

export const login=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await User.findOne({email});
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({error:"Invalid credentials"});
        }
        const token=jwt.sign({userId:user._id}, process.env.JWT_SECRET,{expiresIn: "24h"});
        res.json({
            token,
            user:{
                name:user.name,
                email:user.email,
            },
        })
    }catch{
        res.status(500).json({ error: "Login failed" });
    }
}