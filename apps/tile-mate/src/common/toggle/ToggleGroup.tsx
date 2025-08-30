import { Component, ParentProps } from "solid-js";
import staticStyles from "./ToggleGroup.module.css";
import { StyledComponentProps } from "../StyledComponent";

type Props = ParentProps<StyledComponentProps>;

export const ToggleGroup: Component<Props> = ({
  children,
  class: className,
  ...props
}) => {
  return (
    <div {...props} class={`${staticStyles.toggleGroup} ${className}`}>
      {children}
    </div>
  );
};
