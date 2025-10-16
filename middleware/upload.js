// import multer from 'multer';

// const storageProduct = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/profile/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${file.fieldname}${Date.now()}.jpg`);
//   }
// });

// const uploadProfile = multer({ storage: storageProduct });

// export { uploadProfile };




import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
// ✅ Configure S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});



const uploadFileToS3 = async (file) => {
  const ext = path.extname(file.originalname);
  console.log("File Extension:", ext);
  console.log("Detected MIME Type:", file.mimetype);

  // Ensure correct MIME type
  let contentType = file.mimetype;

  // Use switch to determine MIME type based on file extension
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".gif":
      contentType = "image/gif";
      break;
    case ".mp4":
      contentType = file.mimetype === "application/octet-stream" ? "video/mp4" : "video/mp4";
      break;
    case ".avi":
      contentType = "video/x-msvideo";
      break;
    case ".mov":
      contentType = "video/quicktime";
      break;
    case ".pdf":
      contentType = "application/pdf";
      break;
    case ".txt":
      contentType = "text/plain";
      break;
    case ".csv":
      contentType = "text/csv";
      break;
    default:
      contentType = mime.lookup(ext) || "application/octet-stream";
  }

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${Date.now()}${ext}`,
    Body: file.buffer,
    ContentType: contentType,
    ContentDisposition: 'inline',
    // ACL: 'public-read',
  };

  try {
    const data = await s3.send(new PutObjectCommand(uploadParams));
    console.log("data>>>>>>>>>>", data)
    return {
      Location: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`,
      Key: uploadParams.Key,
    };
  } catch (err) {
    console.error("Error uploading file: ", err);
    throw new Error("Error uploading file");
  }
};

// ✅ Configure Multer-S3 storage
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,

//     key: (req, file, cb) => {
//       let folder = "uploads/";
//       if (file.mimetype.startsWith("image/")) {
//         folder = "images/";
//       } else if (file.mimetype.startsWith("video/")) {
//         folder = "videos/";
//       }
//       let fileName = `${folder}${Date.now()}_${file.originalname}`;
//       cb(null, fileName);
//     },
//   }),
// });

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage });

// ✅ Function to get the public URL of the uploaded file
const getPublicUrl = (fileKey) =>
  `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;


// // 🗑️ Function to delete a file from S3
const deleteFileFromS3 = async (fileUrl) => {
  if (!fileUrl) return;
  const fileKey = fileUrl.split(".amazonaws.com/")[1];
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    console.log(`🗑️ Deleted from S3: ${fileKey}`);
  } catch (error) {
    console.error("❌ Error deleting file from S3:", error);
  }
};

export { uploadFileToS3, getPublicUrl, deleteFileFromS3 };


// import multer from 'multer';


// const storageProduct = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/profile/');
//   },
//   filename: (req, file, cb) => {
//     // Extract original file extension
//     const ext =path.extname(file.originalname)
//     cb(null, `${file.fieldname}${Date.now()}${ext}`);
//   }
// });

// const uploadProfile = multer({ storage: storageProduct });

// export { uploadProfile };






