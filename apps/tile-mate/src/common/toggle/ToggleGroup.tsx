import { Component, JSX, ParentProps } from "solid-js";
import staticStyles from "./ToggleGroup.module.css";

type Props = ParentProps<unknown>;

export const ToggleGroup: Component<Props> = (props) => {
  return <div class={staticStyles.toggleGroup}>{props.children}</div>;
};
