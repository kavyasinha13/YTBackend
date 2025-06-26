import {v2 as cloudinary}  from "cloudinary";
import fs from "fs";

 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET,// Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary= async(localFilePath)=>{
        try{
            if(!localFilePath) return null
            //upload file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            })
            //file has been uploaded successfully
            //console.log("file uploaded successfully", response.url);
            fs.unlinkSync(localFilePath);
            console.log(response);
        
            return response;

        } catch(error){
            fs.unlinkSync(localFilePath)// remove the locally saved temporarily file as upload get failed
            return null;
        }
    }

    const deleteOnCloudinary = async (public_id, resource_type="image") => {
    try {
        if (!public_id) return null;

        //delete file from cloudinary
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: `${resource_type}`
        });
    } catch (error) {
        return error;
        console.log("delete on cloudinary failed", error);
    }
};

    export {uploadOnCloudinary,deleteOnCloudinary}