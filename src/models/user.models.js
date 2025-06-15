
import mongoose,{Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,//since we cant store image on the server we store images on a third party service like cloudinary and URL and use this URL here
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true, 'Password is required']
    },
    refreshToken:{
        type:String,
    }

},
 {
    timestamps : true,
 }
)

//if you want to do something before a particular thing like just before saving, you want to encrypt password

 userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
 })

 //creating methods
 userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password , this.password);
 }

 userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
        }
    )
 }

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        }
    )
}

export const User = mongoose.model("User",userSchema);