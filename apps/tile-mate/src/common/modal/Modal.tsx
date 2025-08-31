import {
  type Component,
  type JSX,
  createEffect,
  onCleanup,
  ParentProps,
  getOwner,
  runWithOwner,
} from "solid-js";
import { StyledComponentProps } from "../StyledComponent";
import styles from "./Modal.module.css";
import { Button } from "../button/Button";
import { render } from "solid-js/web";

type Props = ParentProps<
  StyledComponentProps<{
    title: string;
    isOpen?: boolean;
    onClose?: () => void;
  }>
>;

export const Modal: Component<Props> = ({
  children,
  title,
  isOpen = false,
  onClose,
  ...props
}) => {
  let dialogRef: HTMLDialogElement | undefined;

  // Get the current owner to ensure effects are properly tracked
  const owner = getOwner();

  const handleDialogEffect = () => {
    if (!dialogRef) return;

    if (isOpen) {
      dialogRef.showModal();
    } else {
      dialogRef.close();
    }
  };

  // Wrap createEffect with runWithOwner if we have an owner
  if (owner) {
    runWithOwner(owner, () => {
      createEffect(handleDialogEffect);
    });
  } else {
    createEffect(handleDialogEffect);
  }

  onCleanup(() => {
    dialogRef?.close();
  });

  const close = () => {
    if (dialogRef) {
      dialogRef.close();
      onClose?.();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    // Only close if clicking the backdrop (dialog element itself)
    if (e.target === dialogRef) {
      close();
    }
  };

  return (
    <dialog
      {...props}
      ref={dialogRef}
      class={styles.modal}
      onClick={handleBackdropClick}
    >
      <div class={styles.window}>
        <div class={styles.titleBar}>
          <h2 class={styles.title}>{title}</h2>
          <Button onClick={close}>x</Button>
        </div>
        <div class={styles.content}>{children}</div>
      </div>
    </dialog>
  );
};

export const showModal = ({
  onClose,
  ...props
}: Omit<Props, "isOpen" | "children"> & {
  children?: JSX.Element | (() => JSX.Element);
}): (() => void) => {
  // Capture the current owner to preserve reactive context
  const owner = getOwner();
  let dispose: (() => void) | undefined;

  const container = document.createElement("div");
  document.body.appendChild(container);

  const close = () => {
    if (dispose) {
      dispose();
      document.body.removeChild(container);
      dispose = undefined;
    }
  };

  dispose = render(() => {
    // Evaluate children lazily under this render's owner to avoid creating
    // computations outside a root (e.g., when called from event handlers)
    const evaluatedChildren =
      typeof props.children === "function"
        ? (props.children as () => JSX.Element)()
        : props.children;

    return (
      <Modal
        {...props}
        isOpen
        onClose={() => {
          close();
          onClose?.();
        }}
      >
        {evaluatedChildren}
      </Modal>
    );
  }, container);

  return close;
};
