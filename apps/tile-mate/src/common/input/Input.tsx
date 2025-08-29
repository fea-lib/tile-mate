import { Component, JSX } from "solid-js";
import staticStyles from "./Input.module.css";

type Props = {
  value: string | number;
  onInput: JSX.InputHTMLAttributes<HTMLInputElement>["onInput"];
  type?: "text" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
};

export const Input: Component<Props> = (props) => {
  return (
    <input
      type={props.type || "text"}
      class={staticStyles.input}
      value={props.value}
      onInput={props.onInput}
      placeholder={props.placeholder}
      min={props.min}
      max={props.max}
    />
  );
};
