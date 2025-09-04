import { type Component, createSignal, Show } from "solid-js";
import { Button } from "../common/button/Button";
import { Input } from "../common/input/Input";
import { TileIndex, TilesetIndex } from "../types";
import { useTileMateStore } from "../store/TileMateStore";
import { Image } from "./Tile";
import staticStyles from "./TileEditForm.module.css";

type Props = {
  tilesetIndex: TilesetIndex;
  tileIndex: TileIndex;
  initialTint?: string;
  onAccept: (tint?: string) => void;
  onCancel: () => void;
};

export const TileEditForm: Component<Props> = (props) => {
  const { tile, tileSize } = useTileMateStore();
  const [selectedTint, setSelectedTint] = createSignal<string>(
    props.initialTint ?? ""
  );

  const tileData = tile(props.tilesetIndex, props.tileIndex);
  const previewSize = tileSize(props.tilesetIndex); // Fixed larger size for modal preview

  const handleTintChange = (color: string) => {
    setSelectedTint(color);
  };

  const handleAccept = () => {
    const tint = selectedTint();
    props.onAccept(tint || undefined);
  };

  const handleCancel = () => {
    props.onCancel();
  };

  // Create a copy of tile data with the selected tint for preview
  const createTintedTileData = () => {
    if (!tileData || !selectedTint()) return tileData;
    return {
      ...tileData,
      tint: selectedTint(),
    };
  };

  return (
    <Show when={tileData?.img}>
      <div class={staticStyles.container}>
        <div class={staticStyles.previewSection}>
          <div class={staticStyles.preview}>
            <h3>Original</h3>
            <Image
              tilesetIndex={props.tilesetIndex}
              tileIndex={props.tileIndex}
              tileSize={previewSize}
              img={tileData.img}
              class={staticStyles.previewTile}
            />
          </div>

          <div class={staticStyles.preview}>
            <h3>Tinted Preview</h3>
            <Show
              when={selectedTint()}
              fallback={
                <Image
                  tilesetIndex={props.tilesetIndex}
                  tileIndex={props.tileIndex}
                  tileSize={previewSize!}
                  img={tileData.img}
                  class={`${staticStyles.previewTile} ${staticStyles.noTint}`}
                />
              }
            >
              <Image
                tilesetIndex={props.tilesetIndex}
                tileIndex={props.tileIndex}
                tileSize={previewSize}
                img={tileData.img}
                tint={createTintedTileData().tint}
                class={staticStyles.previewTile}
              />
            </Show>
          </div>
        </div>

        <div class={staticStyles.colorSection}>
          <label>Tint Color:</label>
          <Input
            type="color"
            value={selectedTint()}
            onInput={(e) => handleTintChange(e.currentTarget.value)}
          />
          <Show when={selectedTint()}>
            <Button onClick={() => setSelectedTint("")}>Clear</Button>
          </Show>
        </div>

        <div class={staticStyles.actions}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleAccept}>Accept</Button>
        </div>
      </div>
    </Show>
  );
};
