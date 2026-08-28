import { createFileRoute, Link } from '@tanstack/react-router';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { AsciiInput } from '@/components/atoms/Ascii/AsciiInput';
import {
  TimelineBar,
  type TimelineEntry,
} from '@/components/atoms/Ascii/TimelineBar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const Route = createFileRoute('/ascii/docs')({
  component: RouteComponent,
});

const BORDER_SETS = [
  { name: 'ascii', sample: '+-+', note: 'Plain ASCII. The default.' },
  { name: 'light', sample: '┌─┐', note: 'Thin box-drawing lines.' },
  { name: 'heavy', sample: '┏━┓', note: 'Thick box-drawing lines.' },
  { name: 'double', sample: '╔═╗', note: 'Double-line frame.' },
  { name: 'round', sample: '╭─╮', note: 'Rounded corners.' },
  { name: 'dotted', sample: '┌╌┐', note: 'Dashed edges.' },
] as const;

const DEMO_TIMELINE: TimelineEntry[] = [
  {
    id: 'alpha',
    title: 'First entry',
    subtitle: 'Hover or click a segment to select it.',
    start: '2020-01-01',
    end: '2022-06-01',
  },
  {
    id: 'beta',
    title: 'Second entry',
    subtitle: 'Gaps in time stay visible as muted cells.',
    start: '2023-01-01',
    end: 'present',
  },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AsciiBox label={title} footer={`#${id}`} padY={1} fill>
      {children}
    </AsciiBox>
  );
}

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <AsciiBox
        frameColor="var(--border)"
        labelColor="var(--accent)"
        reveal
        fill
      >
        <h1>ASCII_COMPONENTS_DOCS</h1>
        <AsciiBox.Rule />
        <p>
          Reference for the character-grid components used on this site. Every
          example on this page is the real component, live.
        </p>
        <p className="text-ascii-sm">
          <Link to="/" className="underline">
            &lt; back home
          </Link>
        </p>
      </AsciiBox>

      <Section id="asciibox" title="AsciiBox">
        <p>
          A rectangular terminal box whose frame is drawn from single glyphs on
          a monospace grid. It measures its own font with a hidden probe span,
          so every edge lands on a whole character cell.
        </p>
        <AsciiBox.Rule />
        <div className="text-ascii-sm flex flex-col gap-1">
          <div>
            <code>chars</code> — border preset: ascii | light | heavy | double |
            round | dotted, or any custom 8-char string.
          </div>
          <div>
            <code>label</code> / <code>footer</code> — text carved into the top
            or bottom border line.
          </div>
          <div>
            <code>labelAlign</code> — left (default) | center | right.
          </div>
          <div>
            <code>cols</code> / <code>rows</code> — fixed grid size; measured
            from content when omitted.
          </div>
          <div>
            <code>padX</code> / <code>padY</code> — inner padding in cells /
            rows. Defaults: 1 and 0.
          </div>
          <div>
            <code>fill</code> / <code>fillY</code> — stretch width / height to
            the parent instead of hugging content.
          </div>
          <div>
            <code>frameColor</code>, <code>labelColor</code>,{' '}
            <code>frameOpacity</code> — color overrides for the frame glyphs.
          </div>
          <div>
            <code>reveal</code> — scramble-reveal animation. See REVEAL below.
          </div>
          <div>
            <code>onLayout</code> — callback with the settled geometry (cols,
            rows, cell size).
          </div>
        </div>
        <AsciiBox.Rule />
        <div className="flex flex-wrap gap-4 items-start">
          <AsciiBox chars="light" label="light" padY={1}>
            content here
          </AsciiBox>
          <AsciiBox chars="heavy" label="heavy" padY={1}>
            content here
          </AsciiBox>
          <AsciiBox chars="double" label="double" padY={1}>
            content here
          </AsciiBox>
          <AsciiBox chars="round" label="round" padY={1}>
            content here
          </AsciiBox>
          <AsciiBox chars="dotted" label="dotted" padY={1}>
            content here
          </AsciiBox>
        </div>
        <AsciiBox.Rule />
        <p className="text-ascii-sm">
          Copy trick: select a whole box and copy it — you get clean plain text
          with the frame redrawn around the content, not DOM noise. A ref also
          exposes <code>toText()</code> for the same output.
        </p>
      </Section>

      <Section id="rule" title="AsciiBox.Rule">
        <p>
          A horizontal divider that spans the content column and joins the side
          rails with tee characters. Place it between children of an AsciiBox:
        </p>
        <AsciiBox.Rule />
        <pre className="text-ascii-sm m-0">{`<AsciiBox label="example">
  <p>top section</p>
  <AsciiBox.Rule />
  <p>bottom section</p>
</AsciiBox>`}</pre>
      </Section>

      <Section id="timelinebar" title="TimelineBar">
        <p>
          A horizontal bar of glyph cells spanning a date range. Each entry's
          width is proportional to its real duration, snapped to whole cells.
          Segments are buttons: hover previews, click selects, arrows cycle.
        </p>
        <AsciiBox.Rule />
        <TimelineBar entries={DEMO_TIMELINE} fill />
        <AsciiBox.Rule />
        <div className="text-ascii-sm flex flex-col gap-1">
          <div>
            <code>entries</code> — TimelineEntry[]: id, title, subtitle, start,
            end ('present' allowed), optional image.
          </div>
          <div>
            <code>start</code> — range start date. Default 2009-01-01.
          </div>
          <div>
            <code>cols</code> — fixed cell count; ignored when fill is set.
          </div>
          <div>
            <code>glyph</code> / <code>gapGlyph</code> — cell characters.
            Default ▎ for both.
          </div>
          <div>
            <code>spaced</code> — put a space between cells.
          </div>
          <div>
            <code>initialIndex</code> — which entry is selected first. Defaults
            to the most recent.
          </div>
          <div>
            <code>reveal</code> — scramble-reveal, decodes left to right.
          </div>
        </div>
        <AsciiBox.Rule />
        <p className="text-ascii-sm">
          Nested inside an AsciiBox it borrows the box's measured cell width, so
          the bar and the frame always share one grid.
        </p>
      </Section>

      <Section id="cornerbutton" title="CornerButton">
        <p>
          A button with four accent-colored <code>+</code> glyphs pinned to its
          corners. On hover the fill flips to accent and the corners turn white.
          Each corner occasionally glitches through random glyphs.
        </p>
        <AsciiBox.Rule />
        <div className="flex gap-4 items-center">
          <Button>DEFAULT</Button>
          <Button compact>COMPACT</Button>
        </div>
        <AsciiBox.Rule />
        <p className="text-ascii-sm">
          <code>compact</code> tightens padding (24px tall vs 40px). All other
          props pass through to the underlying button element.
        </p>
      </Section>

      <Section id="tooltip" title="Tooltip">
        <p>
          A Radix tooltip styled to match: mono type, dashed border, popover
          fill, no rounding. Hover the buttons to see it.
        </p>
        <AsciiBox.Rule />
        <div className="flex gap-4 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>HOVER ME</Button>
            </TooltipTrigger>
            <TooltipContent>tooltip on top</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button compact>TOP</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">tooltip on bottom</TooltipContent>
          </Tooltip>
        </div>
        <AsciiBox.Rule />
        <p className="text-ascii-sm">
          <code>TooltipContent</code> accepts all Radix props: <code>side</code>
          , <code>align</code>, <code>sideOffset</code>. Wrap interactive
          triggers with <code>asChild</code>.
        </p>
      </Section>

      <Section id="asciiinput" title="AsciiInput">
        <p>
          A compact one-row text field: a real input inside a 1px rectangular
          border on --border, exactly 1lh (24px) tall. All inner spacing is in
          whole character cells.
        </p>
        <AsciiBox.Rule />
        <div className="flex flex-col gap-4 max-w-md">
          <AsciiInput label="default" placeholder="type here..." prompt=">" />
          <AsciiInput
            label="with footer"
            footer="hint or counter lives below"
            placeholder="search"
          />
          <AsciiInput
            label="invalid"
            aria-invalid="true"
            placeholder="bad value"
          />
          <AsciiInput label="disabled" disabled placeholder="not editable" />
        </div>
        <AsciiBox.Rule />
        <div className="text-ascii-sm flex flex-col gap-1">
          <div>
            <code>label</code> / <code>footer</code> — small muted captions
            above / below the field, outside the control.
          </div>
          <div>
            <code>prompt</code> — glyph printed before the input (e.g. &gt; or
            $), tints accent on focus.
          </div>
          <div>
            States — hover nudges the border; focus tints border + caret
            accent; <code>aria-invalid</code> tints it destructive; disabled
            dashes and dims it.
          </div>
          <div>All other props pass through to the input element.</div>
        </div>
      </Section>

      <Section id="reveal" title="Reveal + Scramble">
        <p>
          Frame characters decode through random terminal glyphs. The animation
          runs on one shared requestAnimationFrame loop for the whole page, so
          many boxes at once stay cheap. Honors prefers-reduced-motion by
          rendering instantly.
        </p>
        <AsciiBox.Rule />
        <div className="text-ascii-sm flex flex-col gap-1">
          <div>
            <code>trigger</code> — 'mount' (default) animates on hydration;
            'inView' waits until scrolled into view.
          </div>
          <div>
            <code>stagger</code> — ms added per diagonal step (row + col).
            Default 20.
          </div>
          <div>
            <code>speed</code> — ms between glyph swaps per cell. Default 45.
          </div>
          <div>
            <code>cycles</code> — [min, max] random swaps before a cell settles.
            Default [3, 8].
          </div>
          <div>
            <code>charset</code> — override the glyph alphabet. Default:
            █▓▒░/\|&lt;&gt;+-*_=~·∙◦#$@%&amp;"
          </div>
        </div>
        <AsciiBox.Rule />
        <p className="text-ascii-sm">
          Usage: <code>{`<AsciiBox reveal />`}</code> for defaults, or{' '}
          <code>{`<AsciiBox reveal={{ trigger: 'inView', stagger: 30 }} />`}</code>
        </p>
      </Section>
    </div>
  );
}
