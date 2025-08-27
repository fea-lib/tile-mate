import {
  createContext,
  useContext,
  createSignal,
  JSX,
  Component,
  createEffect,
} from "solid-js";

type TilesetState = {
  tilesetImage: string;
  tileSize: number;
  columns: () => number;
  setColumns: (cols: number) => void;
  rows: () => number;
  setRows: (rows: number) => void;
  selectedTile: () => { x: number; y: number } | null;
  setSelectedTile: (tile: { x: number; y: number } | null) => void;
};

const TilesetContext = createContext<TilesetState>();

type Props = {
  children: JSX.Element;
  tilesetImage: string;
  tileSize: number;
  columns?: number;
  rows?: number;
};

export const TilesetContextProvider: Component<Props> = (props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [columns, setColumns] = createSignal<number>(props.columns ?? 0);
  const [rows, setRows] = createSignal<number>(props.rows ?? 0);
  const [selectedTile, setSelectedTile] = createSignal<{
    x: number;
    y: number;
  } | null>(null);

  createEffect(() => {
    if (props.columns && props.rows) return;

    setIsLoading(true);
    const img = new Image();

    img.onload = () => {
      const calculatedColumns = Math.floor(img.naturalWidth / props.tileSize);
      const calculatedRows = Math.floor(img.naturalHeight / props.tileSize);

      // Use provided dimensions or calculate from image
      setColumns(calculatedColumns);
      setRows(calculatedRows);
      setIsLoading(false);
    };

    img.onerror = () => {
      console.error("Failed to load tileset image:", props.tilesetImage);
      setIsLoading(false);
    };

    img.src = props.tilesetImage;
  });

  const value = {
    isLoading,
    tilesetImage: props.tilesetImage,
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
