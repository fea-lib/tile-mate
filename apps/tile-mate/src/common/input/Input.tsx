import { Component, JSX } from "solid-js";
import staticStyles from "./Input.module.css";
import { StyledComponentProps } from "../StyledComponent";

type Props = StyledComponentProps<{
  value: string | number;
  onInput?: JSX.InputHTMLAttributes<HTMLInputElement>["onInput"];
  type?: "color" | "text" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
}>;

export const Input: Component<Props> = ({
  type = "text",
  class: className,
  ...props
}) => {
  return (
    <input
      {...props}
      type={type}
      class={`${staticStyles.input} ${className}`}
    />
  );
};
