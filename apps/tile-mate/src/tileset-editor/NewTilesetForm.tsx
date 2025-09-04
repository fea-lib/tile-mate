import { Component, createSignal, Show, onCleanup } from "solid-js";
import { Button } from "../common/button/Button";
import { Input } from "../common/input/Input";
import { useTileMateStore } from "../store/TileMateStore";
import staticStyles from "./NewTilesetForm.module.css";

type Props = {
  onCancel?: () => void;
  onSubmit?: () => void;
};

export const NewTilesetForm: Component<Props> = ({ onCancel, onSubmit }) => {
  const { addTileset, addEmptyTileset } = useTileMateStore();

  const [tileSize, setTileSize] = createSignal(48);
  const [imageFile, setImageFile] = createSignal<File | null>(null);
  const [imageUrl, setImageUrl] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  // Helper: read the selected file as a persistent data URL so the app
  // doesn't depend on a temporary blob: URL that might be revoked later.
  const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  // Cleanup object URL when component unmounts
  onCleanup(() => {
    const url = imageUrl();
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    // Clean up previous object URL
    const previousUrl = imageUrl();
    if (previousUrl && previousUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    } else {
      setImageFile(null);
      setImageUrl("");
    }
  };

  const handleTileSizeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      setTileSize(value);
    }
  };

  const handleAdd = async () => {
    if (isLoading()) return;

    setIsLoading(true);

    try {
      if (imageFile()) {
        // Read the file as a data URL to ensure the source remains valid
        // after the preview blob URL is revoked.
        const dataUrl = await readFileAsDataURL(imageFile()!);
        await addTileset(dataUrl, tileSize());
      } else {
        // Add empty tileset with default 5x5 grid
        addEmptyTileset(tileSize(), 5, 5);
      }

      // Reset form and close dialog
      resetForm();
      onSubmit?.();
    } catch (error) {
      console.error("Failed to add tileset:", error);
      alert("Failed to add tileset. Please check the image file.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    // Clean up object URL before resetting
    const url = imageUrl();
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }

    setTileSize(16);
    setImageFile(null);
    setImageUrl(null);
    setIsLoading(false);

    // Clear file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleClose = () => {
    if (!isLoading()) {
      resetForm();
      onCancel?.();
    }
  };

  return (
    <div class={staticStyles.form}>
      <div class={staticStyles.field}>
        <label>Tileset Image (Optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading()}
          class={staticStyles.fileInput}
        />
      </div>

      <Show when={imageUrl()}>
        <div class={staticStyles.field}>
          <label>Preview:</label>
          <img
            src={imageUrl()}
            alt="Tileset preview"
            class={staticStyles.preview}
          />
        </div>
      </Show>

      <div class={staticStyles.field}>
        <label>Tile Size (px):</label>
        <Input
          type="number"
          value={tileSize()}
          min={1}
          max={256}
          onInput={handleTileSizeChange}
        />
      </div>

      <div class={staticStyles.actions}>
        <Button onClick={handleAdd}>
          <Show when={isLoading()} fallback="Add">
            Adding...
          </Show>
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </div>
    </div>
  );
};
