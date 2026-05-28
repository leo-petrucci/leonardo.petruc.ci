import { useState } from 'react';
import { H2 } from '@/components/ui/typography';

export type Job = {
  title: string;
  company: string;
  companyLogo: string;
  startDate: Date;
  endDate: Date | null;
  bgColor: string;
};

function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

function formatPeriod(start: Date, end: Date | null): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const endLabel = end ? fmt(end) : 'Current';
  return `${fmt(start)} - ${endLabel}`;
}

function durationLabel(months: number): string {
  const years = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}yr`);
  if (m > 0) parts.push(`${m}mo`);
  return parts.join(' ') || '<1mo';
}

export const JobTimeline = ({ jobs }: { jobs: Job[] }) => {
  const now = new Date();
  const chronological = [...jobs].reverse();
  const mostRecentIdx = chronological.length - 1;

  const totalMonths = chronological.reduce((acc, job) => {
    return acc + monthsBetween(job.startDate, job.endDate ?? now);
  }, 0);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const displayIdx = activeIdx ?? mostRecentIdx;
  const activeJob = chronological[displayIdx];

  // Build boundary labels
  const boundaries: { label: string; positionPercent: number }[] = [];
  let cumulative = 0;
  chronological.forEach((job, i) => {
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const segMonths =
      monthsBetween(job.startDate, job.endDate ?? now) / totalMonths;
    if (i === 0) {
      boundaries.push({ label: fmt(job.startDate), positionPercent: 0 });
    }
    cumulative += segMonths;
    const endLabel = job.endDate ? fmt(job.endDate) : 'Present';
    boundaries.push({
      label: endLabel,
      positionPercent: Math.min(cumulative * 100, 100),
    });
  });

  return (
    <div className="w-full">
      <H2 className="border-0 text-base font-medium p-0 mb-4">Experience</H2>
      <div className="relative w-full h-16">
        {/* Timeline track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 flex rounded-full overflow-hidden">
          {chronological.map((job, i) => {
            const width =
              (monthsBetween(job.startDate, job.endDate ?? now) /
                totalMonths) *
              100;
            const isCurrent = i === mostRecentIdx;
            return (
              <div key={i} className="relative">
                <div
                  className="relative h-full cursor-pointer transition-all duration-200 hover:opacity-80"
                  style={{
                    width: `${width}%`,
                    backgroundColor: job.bgColor,
                    borderRight:
                      i < chronological.length - 1
                        ? '2px solid white'
                        : undefined,
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                >
                  {isCurrent && (
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full border-2 border-background z-10"
                      style={{ backgroundColor: job.bgColor }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date labels */}
      <div className="flex w-full mt-1 relative h-4">
        {boundaries.map((b, i) => (
          <span
            key={i}
            className="text-[11px] text-muted-foreground/60 absolute"
            style={{
              left: `${b.positionPercent}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {b.label}
          </span>
        ))}
      </div>

      {/* Active job tooltip */}
      <div className="relative flex justify-center mt-4">
        <div className="bg-popover text-popover-foreground rounded-lg border shadow-lg p-3 text-sm inline-flex items-center gap-3">
          {activeJob.companyLogo && (
            <img
              src={activeJob.companyLogo}
              alt={activeJob.company}
              className="h-8 w-8 rounded object-contain shrink-0 self-center"
            />
          )}
          <div>
            <p className="font-semibold text-foreground">
              {activeJob.company}
            </p>
            <p className="text-muted-foreground text-sm">
              {activeJob.title}
            </p>
            <p className="text-muted-foreground/60 text-xs mt-0.5">
              {formatPeriod(activeJob.startDate, activeJob.endDate)} ·{' '}
              {durationLabel(
                monthsBetween(
                  activeJob.startDate,
                  activeJob.endDate ?? now,
                ),
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};