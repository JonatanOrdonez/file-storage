import { Router } from "express";
import multer from "multer";
import { uploadImage, createImage, getImages } from "./images.controller";

const upload = multer({ storage: multer.memoryStorage() });

export const router = Router();

router.get("/", getImages);
router.post("/", createImage);
router.post("/upload", upload.single("file"), uploadImage);
