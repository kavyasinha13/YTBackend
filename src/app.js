import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

//handling cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

//handling and allowing json requests too(form data)
app.use(express.json({limit: "16kb"}))

//handling URL
app.use(express.urlencoded({extended: true, limit : "16kb"}))

//storing images and files on our server so we make a public folder so that everyone can access them
app.use(express.static("public"))

//CRUD operations for cookie
app.use(cookieParser())

export {app}
