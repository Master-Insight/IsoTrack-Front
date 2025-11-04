import * as LabelPrimitive from '@radix-ui/react-label';
import clsx from 'clsx';
import * as React from 'react';

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={clsx('text-sm font-medium text-slate-700', className)}
      {...props}
    />
  ),
);

Label.displayName = LabelPrimitive.Root.displayName;
