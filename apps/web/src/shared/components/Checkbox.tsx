import { forwardRef, type InputHTMLAttributes } from 'react'

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className = '', ...rest },
  ref,
) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 text-sm text-stone-700 ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="size-4 rounded border-stone-300 accent-stone-900"
        {...rest}
      />
      {label}
    </label>
  )
})
