import { Children, isValidElement, type ReactNode } from 'react';

/** One numbered step: an optional title (from `h3`) plus its content nodes. */
interface StepGroup {
  title: ReactNode | undefined;
  content: ReactNode[];
}

/**
 * Splits MDX children into steps. Every `h3` starts a new step and becomes
 * its title; everything after it belongs to that step until the next `h3`.
 */
function groupSteps(children: ReactNode): StepGroup[] {
  const groups: StepGroup[] = [];
  let current: StepGroup | undefined;

  for (const child of Children.toArray(children)) {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === 'h3') {
      current = { title: child.props.children, content: [] };
      groups.push(current);
    } else {
      if (!current) {
        current = { title: undefined, content: [] };
        groups.push(current);
      }
      current.content.push(child);
    }
  }

  return groups;
}

/**
 * Numbered, vertically connected step list for tutorials. Wrap markdown with
 * `h3` headings in MDX; each heading starts a new auto-numbered step.
 *
 * @example
 * <Steps>
 *   ### Install
 *   Run the command.
 * </Steps>
 */
export function Steps({ children }: { children?: ReactNode }) {
  const steps = groupSteps(children);

  return (
    // `not-prose` + `list-none` keep prose list padding and native ol
    // markers from clashing with the custom number badges and rail.
    <ol className="my-6 list-none space-y-8 not-prose [&_p]:my-2 [&>li]:list-none">
      {steps.map((step, i) => (
        <li key={i} className="relative list-none border-l border-dashed pl-8">
          <span className="absolute -left-3 top-0 z-10 flex h-6 w-6 items-center justify-center border border-dashed bg-[var(--background)] font-departure text-ascii-sm text-[var(--accent)]">
            {i + 1}
          </span>
          {step.title ? (
            <h3 className="scroll-m-20 pt-0.5 text-lg font-semibold tracking-tight">
              {step.title}
            </h3>
          ) : null}
          {step.content}
        </li>
      ))}
    </ol>
  );
}
