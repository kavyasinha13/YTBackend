import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

//handling cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}))

//handling and allowing json requests too(form data)
app.use(express.json())

//handling URL
app.use(express.urlencoded({extended: true, limit : "16kb"}))

//storing images and files on our server so we make a public folder so that everyone can access them
app.use(express.static("public"))

//CRUD operations for cookie
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter);


//http://localhost:8000/api/v1/users/register


export {app}
