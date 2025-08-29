import { Component, JSX } from "solid-js";
import staticStyles from "./ToggleGroup.module.css";

type Props = {
  children: JSX.Element;
};

export const ToggleGroup: Component<Props> = (props) => {
  return <div class={staticStyles.toggleGroup}>{props.children}</div>;
};
