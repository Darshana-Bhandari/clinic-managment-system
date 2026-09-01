import {v2 as cloudinary } from "cloudinary"
import {ENV} from "./env.js"



// configuration cloudinary
cloudinary.config({
    cloud_name:ENV.Cloud_Name,
    api_key:ENV.Cloud_API_KEY,
    api_secret:ENV.Cloud_API_SECRET,
    secure:true 

})


//upload file to cloudinary
export const uploadToCloudinary = async (file,options={})=>{
    try{
        const result= await cloudinary.uploader(file.path,{
            folder:options.folder  || 'cmsfolder',
            public_id:options.public_id || 'undefined',
            resource_type:options.resource_type || 'auto',
            transformation:options.transformation || [],
            ...options,

        });
        return result;
    }
    catch(error){
        console.error("Cloudinary upload errro:",error)
        throw new Error("Failed to upload to cloudinary");

    }
}

// upload multiple files ot cloudinary 
export const uploadMulterToCloudinary =async(files,options={})=>{
    try{
        const uploadPromises = files.map(file=>{
            uploadMulterToCloudinary(file , {...options,
                public_id:`${options.folder || 'healthcare'}/${Date.now()}-${file.originalname.split('.')[0]}`,

            })
        })
        return await Promise.all(uploadPromises)
    }
    catch(error){
         console.error("Cloudinary upload errro:",error)
        throw new Error("Failed to upload  multiple file to cloudinary");

    }
}



// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete from Cloudinary');
  }
};

// Get Cloudinary URL
export const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};


export default cloudinary;