import Boom from "@hapi/boom";
import { pool } from "../../config/database";
import { supabase } from "../../config/supabase";
import { StorageImage, CreateImageDTO } from "./images.types";

export const uploadImageService = async (
  file: Express.Multer.File,
): Promise<string> => {
  const uniqueName = `${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(uniqueName, file.buffer, { contentType: file.mimetype });

  if (error) {
    throw Boom.badRequest(error.message);
  }

  return data.path;
};

export const createImageService = async (
  dto: CreateImageDTO,
): Promise<StorageImage> => {
  const result = await pool.query<StorageImage>(
    `INSERT INTO public.storage_images (name, path) VALUES ($1, $2) RETURNING *`,
    [dto.name, dto.path],
  );
  return result.rows[0];
};

export const getImagesService = async (): Promise<StorageImage[]> => {
  const result = await pool.query<StorageImage>(
    `SELECT * FROM public.storage_images ORDER BY created_at DESC`,
  );
  return result.rows;
};
