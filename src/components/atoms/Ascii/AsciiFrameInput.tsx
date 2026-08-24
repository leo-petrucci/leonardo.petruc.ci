import { useState, type InputHTMLAttributes } from 'react';
import { AsciiBox } from './Ascii';

/**
 * AsciiFrameInput — the original frame-drawn input (kept for reference). A one-row character-cell input field.
 *
 * A real <input> sits inside an AsciiBox frame, so the border is drawn from
 * glyphs on the same monospace grid as every other ascii component. Focus
 * swaps the frame preset and colors, and the native caret is tinted to match.
 */
export interface AsciiFrameInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Text carved into the top border line while unfocused. */
  label?: string;
  /** Text carved into the bottom border line (e.g. a hint or counter). */
  footer?: string;
  /** Fixed column count. Ignored when `fill` is set. Default 32. */
  cols?: number;
  /** Stretch to the parent width instead of a fixed column count. */
  fill?: boolean;
  /** Glyph printed before the input, e.g. '>' or '$'. */
  prompt?: string;
}

export function AsciiFrameInput({
  label,
  footer,
  cols = 32,
  fill = false,
  prompt,
  onFocus,
  onBlur,
  ...rest
}: AsciiFrameInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <AsciiBox
      chars="light"
      label={label}
      footer={footer}
      cols={fill ? undefined : cols}
      fill={fill}
      padY={0}
      frameColor={focused ? 'var(--accent)' : 'var(--border)'}
      labelColor={focused ? 'var(--accent)' : 'var(--muted-foreground)'}
    >
      <div className="flex items-center gap-1 leading-[1lh]">
        {prompt && (
          <span aria-hidden="true" className="select-none text-[var(--muted-foreground)]">
            {prompt}
          </span>
        )}
        <input
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className="w-full min-w-0 bg-transparent border-0 outline-none p-0 m-0 font-[inherit] text-inherit"
          style={{ caretColor: 'var(--accent)', fontVariantLigatures: 'none' }}
        />
      </div>
    </AsciiBox>
  );
}

export default AsciiFrameInput;
