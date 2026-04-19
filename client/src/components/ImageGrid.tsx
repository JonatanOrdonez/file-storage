import { useState } from "preact/hooks";
import { useImages, STORAGE_URL } from "../providers/ImagesProvider";
import type { StorageImage } from "../types";

export const ImageGrid = () => {
  const { images, loading } = useImages();
  const [preview, setPreview] = useState<StorageImage | null>(null);

  if (loading) {
    return (
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            class="aspect-square rounded-xl animate-pulse"
            style={{ background: "var(--color-surface)" }}
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div class="flex flex-col items-center gap-3 py-16">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          class="w-12 h-12"
          style={{ color: "var(--color-text-muted)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
          />
        </svg>
        <p class="text-sm" style={{ color: "var(--color-text-muted)" }}>
          No hay imágenes. Sube la primera.
        </p>
      </div>
    );
  }

  return (
    <>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            class="rounded-xl overflow-hidden animate-fade-in cursor-pointer"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={() => setPreview(image)}
            onMouseLeave={() => setPreview(null)}
          >
            <img
              src={`${STORAGE_URL}/${image.path}`}
              alt={image.name}
              class="w-full aspect-square object-cover"
              loading="lazy"
            />
            <div class="px-3 py-2">
              <p
                class="text-xs truncate"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {image.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
        >
          <div class="max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3">
            <img
              src={`${STORAGE_URL}/${preview.path}`}
              alt={preview.name}
              class="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <p
              class="text-sm font-medium"
              style={{ color: "white" }}
            >
              {preview.name}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
