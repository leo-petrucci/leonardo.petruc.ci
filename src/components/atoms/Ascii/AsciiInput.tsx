import { type InputHTMLAttributes, type ReactNode } from 'react';

/**
 * AsciiInput — a compact one-row text field.
 *
 * A real <input> inside a 1px rectangular border on --border. The control is
 * exactly one line tall (1lh = 24px here). Focus tints the border and the
 * caret accent; the caret matches. All inner spacing is in whole character
 * cells (1ch), so text lands on the same grid as the ascii components.
 *
 * States:
 * - hover nudges the border to muted-foreground
 * - focus tints border + caret accent
 * - aria-invalid tints the border destructive
 * - disabled dims the field and dashes its border
 */
export interface AsciiInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Small muted caption above the field. */
  label?: ReactNode;
  /** Small muted caption below the field (hint, counter...). */
  footer?: ReactNode;
  /** Glyph printed before the input, e.g. '>' or '$'. */
  prompt?: string;
}

export function AsciiInput({
  label,
  footer,
  prompt,
  className = '',
  ...rest
}: AsciiInputProps) {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      {label && (
        <label className="text-ascii-sm text-muted-foreground leading-[24px] h-6">
          {label}
        </label>
      )}
      <div
        className={
          'group flex items-center h-[1lh] max-h-6 box-border bg-transparent ' +
          'border border-solid border-[var(--border)] ' +
          'hover:not-focus-within:border-[var(--muted-foreground)] ' +
          'focus-within:border-[var(--accent)] ' +
          'has-[[aria-invalid=true]]:border-[var(--destructive)] ' +
          'has-[[disabled]]:border-dashed has-[[disabled]]:opacity-60'
        }
      >
        {prompt && (
          <span
            aria-hidden="true"
            className="select-none pl-[1ch] w-[1ch] text-center leading-[1lh] text-[var(--muted-foreground)] group-focus-within:text-[var(--accent)]"
          >
            {prompt}
          </span>
        )}
        <input
          {...rest}
          className={
            'h-full w-full min-w-0 m-0 border-0 bg-transparent p-0 font-[inherit] text-inherit outline-none ' +
            'selection:bg-[var(--accent)] selection:text-[var(--background)] ' +
            'placeholder:text-[var(--muted-foreground)] ' +
            (prompt ? 'pl-[1ch] pr-[1ch] ' : 'px-[1ch] ')
          }
          style={{ caretColor: 'var(--accent)', fontVariantLigatures: 'none' }}
        />
      </div>
      {footer && (
        <span className="text-ascii-sm text-muted-foreground leading-[24px] h-6">
          {footer}
        </span>
      )}
    </div>
  );
}

export default AsciiInput;
