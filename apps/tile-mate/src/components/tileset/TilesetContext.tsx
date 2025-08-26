import {
  createContext,
  useContext,
  createSignal,
  JSX,
  Component,
} from "solid-js";

type TilesetState = {
  tilesetImage: () => string;
  setTilesetImage: (image: string) => void;
  columns: () => number;
  setColumns: (cols: number) => void;
  rows: () => number;
  setRows: (rows: number) => void;
  tileSize: number;
  selectedTile: () => { x: number; y: number } | null;
  setSelectedTile: (tile: { x: number; y: number } | null) => void;
};

const TilesetContext = createContext<TilesetState>();

type Props = {
  children: JSX.Element;
  columns: number;
  rows: number;
  tilesetImage: string;
  tileSize: number;
};

export const TilesetContextProvider: Component<Props> = (props) => {
  const [tilesetImage, setTilesetImage] = createSignal<string>(
    props.tilesetImage
  );
  const [columns, setColumns] = createSignal<number>(props.columns);
  const [rows, setRows] = createSignal<number>(props.rows);
  const [selectedTile, setSelectedTile] = createSignal<{
    x: number;
    y: number;
  } | null>(null);

  const value = {
    tilesetImage,
    setTilesetImage,
    columns,
    setColumns,
    rows,
    setRows,
    tileSize: props.tileSize,
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
