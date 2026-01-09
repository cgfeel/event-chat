import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { forwardRef } from 'react';

const sizeClasses = Object.freeze({
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-2.5 text-lg',
});

const variantClasses = Object.freeze({
  outline: 'button-outline',
  danger: 'button-danger',
  primary: 'button-primary',
  secondary: 'button-secondary',
  text: 'button-text',
});

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled = false,
      loading = false,
      size = 'sm',
      variant = 'primary',
      ...props
    },
    ref
  ) => {
    const combinedClasses = [
      'button-base',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ');

    return (
      <button {...props} className={combinedClasses} disabled={disabled || loading} ref={ref}>
        {loading && <FontAwesomeIcon className="animate-spin" icon={faSpinner} />}
        {children}
      </button>
    );
  }
);

if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}

export default Button;

// 定义按钮的属性类型
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
}
