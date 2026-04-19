import { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import {
  uploadImageService,
  createImageService,
  getImagesService,
} from "./images.service";

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) throw Boom.badRequest("file is required");

    const path = await uploadImageService(req.file);
    res.json({ path });
  } catch (error) {
    next(error);
  }
};

export const createImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, path } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw Boom.badRequest("name is required and must be a non-empty string");
    }
    if (!path || typeof path !== "string" || !path.trim()) {
      throw Boom.badRequest("path is required and must be a non-empty string");
    }

    const image = await createImageService({ name: name.trim(), path: path.trim() });
    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

export const getImages = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const images = await getImagesService();
    res.json(images);
  } catch (error) {
    next(error);
  }
};
