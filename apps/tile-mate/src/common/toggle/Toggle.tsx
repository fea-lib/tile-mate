import { Component, JSX, ParentProps } from "solid-js";
import buttonStyles from "../button/Button.module.css";
import staticStyles from "./Toggle.module.css";

type Props = ParentProps<{
  value: JSX.InputHTMLAttributes<HTMLInputElement>["value"];
  isChecked?: JSX.InputHTMLAttributes<HTMLInputElement>["checked"];
  onChange?: JSX.InputHTMLAttributes<HTMLInputElement>["onChange"];
}>;

export const Toggle: Component<Props> = (props) => {
  return (
    <label role="radio" class={`${buttonStyles.button} ${staticStyles.toggle}`}>
      <input
        type="radio"
        name="action"
        value={props.value}
        checked={props.isChecked}
        onChange={props.onChange}
      />
      <span>{props.children}</span>
    </label>
  );
};
