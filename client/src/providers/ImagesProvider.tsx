import { createContext } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import imageCompression from "browser-image-compression";
import { useAxios } from "./AxiosProvider";
import type { StorageImage } from "../types";

interface ImagesContextType {
  images: StorageImage[];
  loading: boolean;
  uploading: boolean;
  uploadAndCreateImage: (file: File) => Promise<void>;
}

const ImagesContext = createContext<ImagesContextType | null>(null);

export const STORAGE_URL = `${import.meta.env.VITE_SUPABASE_STORAGE_URL as string}/images`;

export const ImagesProvider = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const axios = useAxios();
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    const { data } = await axios.get<StorageImage[]>("/api/images");
    setImages(data);
    setLoading(false);
  };

  const uploadAndCreateImage = async (file: File) => {
    setUploading(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      });

      const formData = new FormData();
      formData.append("file", compressed, file.name);

      const { data: uploadResult } = await axios.post<{ path: string }>(
        "/api/images/upload",
        formData,
      );

      const { data: image } = await axios.post<StorageImage>("/api/images", {
        name: file.name,
        path: uploadResult.path,
      });

      setImages((prev) => [image, ...prev]);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <ImagesContext.Provider
      value={{ images, loading, uploading, uploadAndCreateImage }}
    >
      {children}
    </ImagesContext.Provider>
  );
};

export const useImages = () => {
  const ctx = useContext(ImagesContext);
  if (!ctx) throw new Error("useImages must be used within ImagesProvider");
  return ctx;
};
