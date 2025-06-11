import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  fallback: string;
  className?: string;
  alt?: string;
}

export function Avatar({ src, fallback, className, alt }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt || fallback}
        className="h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
      >
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}