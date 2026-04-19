import { useState, useRef } from "preact/hooks";
import { useImages } from "../providers/ImagesProvider";

export const DropZone = () => {
  const { uploading, uploadAndCreateImage } = useImages();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    uploadAndCreateImage(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer?.files[0]);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    handleFile(input.files?.[0]);
    input.value = "";
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      class="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200"
      style={{
        borderColor: dragOver
          ? "var(--color-primary)"
          : "var(--color-border)",
        background: dragOver
          ? "var(--color-primary-light)"
          : "var(--color-surface)",
        opacity: uploading ? 0.5 : 1,
        pointerEvents: uploading ? "none" : "auto",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        class="hidden"
      />

      {uploading ? (
        <>
          <div
            class="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          />
          <p class="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Comprimiendo y subiendo...
          </p>
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            class="w-10 h-10"
            style={{ color: "var(--color-text-muted)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <p class="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Arrastra una imagen o haz clic para seleccionar
          </p>
          <p class="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Se comprimirá automáticamente antes de subir
          </p>
        </>
      )}
    </div>
  );
};
