import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}
export declare function Button({ className, variant, size, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
