import { Component, JSX, ParentProps } from "solid-js";
import buttonStyles from "../button/Button.module.css";
import staticStyles from "./Toggle.module.css";
import { StyledComponentProps } from "../StyledComponent";

type Radio = {
  type: "radio";
  value: JSX.InputHTMLAttributes<HTMLInputElement>["value"];
};

type Checkbox = {
  type: "checkbox";
  value?: JSX.InputHTMLAttributes<HTMLInputElement>["value"];
};

type Props = ParentProps<
  StyledComponentProps<
    {
      name: JSX.InputHTMLAttributes<HTMLInputElement>["name"];
      isChecked?: JSX.InputHTMLAttributes<HTMLInputElement>["checked"];
      onChange?: JSX.InputHTMLAttributes<HTMLInputElement>["onChange"];
    } & (Checkbox | Radio)
  >
>;

export const Toggle: Component<Props> = ({
  children,
  class: className,
  isChecked,
  type,
  ...props
}) => {
  return (
    <label
      role={type}
      class={`${buttonStyles.button} ${staticStyles.toggle} ${className}`}
    >
      <input type={type} checked={isChecked} {...props} />
      <span>{children}</span>
    </label>
  );
};
