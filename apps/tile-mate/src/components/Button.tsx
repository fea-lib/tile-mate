import type { Component, JSX } from 'solid-js';

interface ButtonProps {
  onClick: () => void;
  children: JSX.Element;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: Component<ButtonProps> = (props) => {
  const buttonClass = () => {
    const base =
      'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
      secondary:
        'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    };
    const variant = props.variant || 'primary';
    const disabled = props.disabled ? 'opacity-50 cursor-not-allowed' : '';

    return `${base} ${variants[variant]} ${disabled}`;
  };

  return (
    <button
      class={buttonClass()}
      onClick={() => props.onClick()}
      disabled={props.disabled}
      type="button"
    >
      {props.children}
    </button>
  );
};

export default Button;
