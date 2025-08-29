import { Component, JSX, ParentProps } from "solid-js";
import staticStyles from "./Button.module.css";

type Props = ParentProps<{
  onClick?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}>;

export const Button: Component<Props> = (props) => {
  return (
    <button type="button" class={staticStyles.button} onClick={props.onClick}>
      <span>{props.children}</span>
    </button>
  );
};
