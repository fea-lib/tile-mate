import {
  createContext,
  useContext,
  createSignal,
  JSX,
  Component,
  createEffect,
} from "solid-js";
import { Tile, TileIndex } from "../types";

type TilesetState = {
  tilesetImage: string;
  tileSize: number;
  tiles: () => Tile[];
  tile: (id: TileIndex) => Tile | undefined;
  columns: () => number;
  setColumns: (cols: number) => void;
  rows: () => number;
  setRows: (rows: number) => void;
  selectedTile: () => TileIndex | null;
  setSelectedTile: (id: TileIndex | null) => void;
  replaceTile: (targetId: TileIndex, sourceId: TileIndex) => void;
  swapTiles: (tileId1: TileIndex, tileId2: TileIndex) => void;
};

const TilesetContext = createContext<TilesetState>();

type Props = {
  children: JSX.Element;
  tilesetImage: string;
  tileSize: number;
};

export const TilesetContextProvider: Component<Props> = (props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [columns, setColumns] = createSignal<number>(0);
  const [rows, setRows] = createSignal<number>(0);
  const [tiles, setTiles] = createSignal<Tile[]>([]);
  const [selectedTile, setSelectedTile] = createSignal<TileIndex | null>(null);

  createEffect(() => {
    setIsLoading(true);
    const img = new Image();

    img.onload = () => {
      const calculatedColumns = Math.floor(img.naturalWidth / props.tileSize);
      const calculatedRows = Math.floor(img.naturalHeight / props.tileSize);

      // Use provided dimensions or calculate from image
      setColumns(calculatedColumns);
      setRows(calculatedRows);

      const newTiles: Tile[] = [];
      for (let y = 0; y < calculatedRows; y++) {
        for (let x = 0; x < calculatedColumns; x++) {
          newTiles.push({ index: newTiles.length, imgX: x, imgY: y });
        }
      }
      setTiles(newTiles);

      setIsLoading(false);
    };

    img.onerror = () => {
      console.error("Failed to load tileset image:", props.tilesetImage);
      setIsLoading(false);
    };

    img.src = props.tilesetImage;
  });

  const tile = (id: TileIndex) => tiles()[id];

  const replaceTile = (targetId: TileIndex, sourceId: TileIndex) => {
    const currentTiles = [...tiles()];
    const sourceTile = currentTiles[sourceId];
    if (sourceTile) {
      // Replace target with source tile's image position
      currentTiles[targetId] = {
        ...sourceTile,
        index: currentTiles[targetId].index,
      };

      // Reset source to its original position (identity)
      const sourceX = sourceId % columns();
      const sourceY = Math.floor(sourceId / columns());
      currentTiles[sourceId] = {
        index: currentTiles[sourceId].index,
      };
      setTiles(currentTiles);
    }
  };

  const swapTiles = (tileId1: TileIndex, tileId2: TileIndex) => {
    const currentTiles = [...tiles()];
    const tile1 = { ...currentTiles[tileId1] };
    const tile2 = { ...currentTiles[tileId2] };

    if (tile1 && tile2) {
      // Swap the tiles
      currentTiles[tileId1] = {
        ...tile2,
        index: tileId1,
      };

      currentTiles[tileId2] = {
        ...tile1,
        index: tileId2,
      };

      setTiles(currentTiles);
    }
  };

  const value = {
    tilesetImage: props.tilesetImage,
    tileSize: props.tileSize,
    isLoading,
    columns,
    setColumns,
    rows,
    setRows,
    tiles,
    tile,
    selectedTile,
    setSelectedTile,
    replaceTile,
    swapTiles,
  };

  return (
    <TilesetContext.Provider value={value}>
      {props.children}
    </TilesetContext.Provider>
  );
};

export const useTilesetContext = () => {
  const context = useContext(TilesetContext);
  if (!context) {
    throw new Error("useTilesetContext must be used within a TilesetProvider");
  }
  return context;
};
