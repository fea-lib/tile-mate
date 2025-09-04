import { Component, JSX, splitProps } from "solid-js";
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

export const Input: Component<Props> = (allProps) => {
  // Avoid destructuring props directly to preserve reactivity in Solid
  const [local, others] = splitProps(allProps, ["type", "class"]);

  return (
    <input
      {...others}
      type={local.type ?? "text"}
      class={`${staticStyles.input} ${
        local.type === "color" ? staticStyles.color : ""
      } ${local.class ?? ""}`}
    />
  );
};
