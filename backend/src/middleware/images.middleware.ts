import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  BUCKET_ACCESS_KEY,
  BUCKET_BUCKET_NAME,
  BUCKET_ENDPOINT,
  BUCKET_REGION,
  BUCKET_SECRET_ACCESS_KEY,
} from "../constants";

const s3 = new S3Client({
  endpoint: BUCKET_ENDPOINT,
  region: BUCKET_REGION,
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY!,
    secretAccessKey: BUCKET_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET_BUCKET_NAME!,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(
        null,
        "uploads/" +
        Date.now().toString() +
        "-" +
        file.originalname.split(" ").join("-")
      );
      console.log("Reached here");
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

export const getPresignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_BUCKET_NAME,
    Key: key,
  });

  const url: string = await getSignedUrl(s3, command, {
    expiresIn: 3600,
  });

  return url;
};

export default upload;
