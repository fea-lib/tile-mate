import { JSX } from "solid-js";

export type StyledComponentProps<P extends Record<string, any> = {}> = P & {
  class?: JSX.HTMLAttributes<HTMLElement>["class"];
  style?: JSX.HTMLAttributes<HTMLElement>["style"];
};
