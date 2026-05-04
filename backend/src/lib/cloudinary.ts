import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

console.log(`☁️ [Cloudinary] Config:
  Name: ${process.env.CLOUDINARY_NAME ? '✅' : '❌'}
  Key:  ${process.env.CLOUDINARY_API_KEY ? '✅' : '❌'}
  Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'}`);

export default cloudinary;