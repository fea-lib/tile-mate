import {
  createContext,
  useContext,
  createSignal,
  JSX,
  Component,
  createEffect,
} from "solid-js";

export type TileId = number;

export type Tile = {
  id: TileId;
  imgX: number;
  imgY: number;
};

type TilesetState = {
  tilesetImage: string;
  tileSize: number;
  tiles: () => Tile[];
  tile: (id: TileId) => Tile | undefined;
  columns: () => number;
  setColumns: (cols: number) => void;
  rows: () => number;
  setRows: (rows: number) => void;
  selectedTile: () => TileId | null;
  setSelectedTile: (id: TileId | null) => void;
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
  const [selectedTile, setSelectedTile] = createSignal<TileId | null>(null);

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
          newTiles.push({ id: newTiles.length, imgX: x, imgY: y });
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

  const tile = (id: TileId) => tiles()[id];

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
