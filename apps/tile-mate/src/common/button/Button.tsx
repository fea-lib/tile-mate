import { Component, JSX } from "solid-js";
import staticStyles from "./Button.module.css";

type Props = {
  label: JSX.Element;
};

export const Button: Component<Props> = (props) => {
  return (
    <label class={staticStyles.button}>
      <span>{props.label}</span>
    </label>
  );
};
