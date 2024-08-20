import { getPresignedUrl } from "../middleware/images.middleware";
import { FileTransfer, IRequest } from "../types";
import { Response, Request } from "express";

export const uploadSingleImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const fileData: FileTransfer = { ...req.file };
    const { key } = fileData;

    const url = await getPresignedUrl(key!);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url,
        key,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const uploadMultipleImages = async (req: IRequest, res: Response) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const fileData: FileTransfer[] = Object.values(req.files);

    const data = await Promise.all(
      fileData.map(async (file) => {
        const { key } = file;
        const url = await getPresignedUrl(key!);
        return { url, key };
      })
    );

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};