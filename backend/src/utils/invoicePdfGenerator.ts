import puppeteer from "puppeteer";
import fs from "fs/promises";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getPresignedUrl, s3 } from "../middleware/images.middleware";
import { BUCKET_BUCKET_NAME } from "../constants";
import path from "path";

// Function to generate PDF and store it locally
const generatePDF = async (
  htmlContent: string,
  outputFilePath: string
): Promise<void> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.pdf({
      path: outputFilePath,
      format: "A4",
    });
  } finally {
    await browser.close();
  }
};

// Function to upload PDF from local storage to DigitalOcean Spaces
const uploadPDF = async (filePath: string, key: string): Promise<void> => {
  const fileContent = await fs.readFile(filePath);

  const command = new PutObjectCommand({
    Bucket: BUCKET_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: "application/pdf",
    ACL: "private", // Make sure the file is private
  });

  await s3.send(command);
};

// Function to generate, upload, return the file key, and the pre-signed URL with file cleanup
export const handlePDFGenerationAndUpload = async (
  htmlContent: string,
  fileName: string
): Promise<{ fileKey: string; presignedUrl: string }> => {
  const outputFilePath = path.join(__dirname, fileName);
  const s3Key = `scopic/${Date.now().toString()}-${fileName}`;

  try {
    // 1. Generate PDF and store it in the backend folder
    await generatePDF(htmlContent, outputFilePath);

    // 2. Upload the PDF to DigitalOcean Spaces
    await uploadPDF(outputFilePath, s3Key);

    // 3. Clean up the generated PDF file after upload
    await fs.unlink(outputFilePath);

    // 4. Generate a pre-signed URL for accessing the uploaded PDF
    const presignedUrl = await getPresignedUrl(s3Key, 3600 * 24 * 5); // 5 days

    // 5. Return both the file key and the pre-signed URL
    return { fileKey: s3Key, presignedUrl };
  } catch (error) {
    console.error("Error during PDF generation or upload:", error);

    // Attempt to clean up the file in case of error
    try {
      await fs.unlink(outputFilePath);
    } catch (cleanupError) {
      console.error("Error during file cleanup:", cleanupError);
    }

    throw error; // Re-throw the error to be handled by the calling function
  }
};
