import { DropZone } from "../components/DropZone";
import { ImageGrid } from "../components/ImageGrid";

export const ImagesPage = () => {
  return (
    <div
      class="min-h-svh flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      <header
        class="flex items-center gap-3 px-6 py-4 border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-bg-subtle)",
        }}
      >
        <h1
          class="text-lg font-semibold bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          }}
        >
          File Storage
        </h1>
      </header>

      <div class="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        <DropZone />
        <ImageGrid />
      </div>
    </div>
  );
};
