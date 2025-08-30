import { Component, JSX, ParentProps } from "solid-js";
import staticStyles from "./Button.module.css";
import { StyledComponentProps } from "../StyledComponent";

type Props = ParentProps<
  StyledComponentProps<{
    onClick?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  }>
>;

export const Button: Component<Props> = ({
  children,
  class: className,
  ...props
}) => {
  return (
    <button
      {...props}
      type="button"
      class={`${staticStyles.button} ${className}`}
    >
      <span>{children}</span>
    </button>
  );
};
