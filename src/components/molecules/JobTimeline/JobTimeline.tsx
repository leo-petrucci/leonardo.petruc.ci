import { H2 } from '@/components/ui/typography';

export type Job = {
  title: string;
  company: string;
  companyLogo: string;
  startDate: Date;
  endDate: Date | null; // null = current
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
  const totalMonths = jobs.reduce((acc, job) => {
    return acc + monthsBetween(job.startDate, job.endDate ?? now);
  }, 0);

  return (
    <div className="w-full">
      <H2 className="border-0 text-base font-medium p-0 mb-4">Experience</H2>
      <div className="relative w-full h-16">
        {/* Timeline track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 flex rounded-full overflow-hidden">
          {jobs.map((job, i) => {
            const width =
              (monthsBetween(job.startDate, job.endDate ?? now) /
                totalMonths) *
              100;
            return (
              <div
                key={i}
                className="group relative h-full cursor-pointer transition-all duration-200 hover:brightness-110 hover:scale-y-150"
                style={{ width: `${width}%`, backgroundColor: job.bgColor }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-popover text-popover-foreground rounded-lg border shadow-lg p-3 text-sm">
                    <p className="font-semibold">{job.company}</p>
                    <p className="text-muted-foreground mt-0.5">
                      {job.title}
                    </p>
                    <p className="text-muted-foreground/70 text-xs mt-1">
                      {formatPeriod(job.startDate, job.endDate)} ·{' '}
                      {durationLabel(
                        monthsBetween(job.startDate, job.endDate ?? now),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels row */}
      <div className="flex w-full mt-1">
        {jobs.map((job, i) => {
          const width =
            (monthsBetween(job.startDate, job.endDate ?? now) / totalMonths) *
            100;
          return (
            <div
              key={i}
              className="flex flex-col items-start"
              style={{ width: `${width}%` }}
            >
              <span className="text-[11px] text-muted-foreground/60 leading-tight">
                {job.startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {i === jobs.length - 1 && job.endDate === null && (
                <span className="text-[11px] text-muted-foreground/60 leading-tight">
                  Present
                </span>
              )}
              {i === jobs.length - 1 && job.endDate && (
                <span className="text-[11px] text-muted-foreground/60 leading-tight">
                  {job.endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};