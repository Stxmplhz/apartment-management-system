import cloudinary from './cloudinary';

export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  console.log('📤 [Upload Helper] Starting upload to Cloudinary...');
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Data = buffer.toString('base64');
  const fileUri = `data:${file.type};base64,${base64Data}`;

  const config = {
    folder,
    resource_type: 'auto' as const,
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  console.log(`📤 [Upload Helper] Using Cloud Name: ${config.cloud_name}, Key: ${config.api_key ? '✅' : '❌'}`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(fileUri, config, (error, result) => {
      if (error) {
        console.error('❌ [Upload Helper] Cloudinary Error:', error);
        return reject(error);
      }
      if (!result) return reject(new Error('Upload failed'));
      console.log('✅ [Upload Helper] Upload Success:', result.secure_url);
      resolve(result.secure_url);
    });
  });
};
