import { v2 as cloudinary } from 'cloudinary';

/**
 * Uploads a file to Cloudinary.
 * @param file The file to upload (File object).
 * @param folder The folder in Cloudinary to upload to.
 * @returns The secure URL of the uploaded image.
 */
export async function uploadToCloudinary(file: File, folder: string = 'erp-profiles'): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error(`Cloudinary credentials missing. 
            NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${cloudName ? 'Set' : 'Missing'}, 
            CLOUDINARY_API_KEY: ${apiKey ? 'Set' : 'Missing'}, 
            CLOUDINARY_API_SECRET: ${apiSecret ? 'Set' : 'Missing'}`);
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                    return;
                }
                if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Cloudinary upload failed: No result returned'));
                }
            }
        ).end(buffer);
    });
}
