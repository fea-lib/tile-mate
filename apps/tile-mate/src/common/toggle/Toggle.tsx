import { Component, JSX } from "solid-js";
import staticStyles from "./Toggle.module.css";

type Props = {
  label: JSX.Element;
  value: JSX.InputHTMLAttributes<HTMLInputElement>["value"];
  isChecked?: JSX.InputHTMLAttributes<HTMLInputElement>["checked"];
  onChange?: JSX.InputHTMLAttributes<HTMLInputElement>["onChange"];
};

export const Toggle: Component<Props> = (props) => {
  return (
    <label class={staticStyles.toggle}>
      <input
        type="radio"
        name="action"
        value={props.value}
        checked={props.isChecked}
        onChange={props.onChange}
      />
      <span>{props.label}</span>
    </label>
  );
};
