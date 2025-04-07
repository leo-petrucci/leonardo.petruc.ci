import { CategoryPill } from '@/components/atoms/CategoryPill/CategoryPill';
import { Card } from '@/components/ui/card';
import { H2 } from '@/components/ui/typography';
import { SquareArrowOutUpRight } from 'lucide-react';

type SocialCardProps = {
  title: React.ReactNode;
  subTitle: React.ReactNode;
  companyLogo?: string;
  companyName: React.ReactNode;
  bgColor: string;
  to?: string;
};

export const SocialCard = ({
  bgColor,
  companyLogo,
  companyName,
  subTitle,
  title,
  to,
}: SocialCardProps) => {
  const CardContent = (
    <Card
      className="flex-1 p-0 flex flex-col overflow-hidden"
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div className="flex flex-col p-4 items-start min-h-[95px]">
        <CategoryPill>Social</CategoryPill>
      </div>
      <div className='flex-1 flex flex-col bg-card' style={{
        boxShadow: `0 -1px 2px 0 rgb(0 0 0 / 0.05)`
      }}>
        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <H2 className="border-0 text-base font-medium p-0">{title}</H2>
            <span className="text-muted-foreground text-sm">{subTitle}</span>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-4 p-4 items-center">
          <div className="flex flex-row gap-2">
            <img src={companyLogo} className="h-[21px]" /> {companyName}
          </div>
          <SquareArrowOutUpRight className="w-4 h-4 mt-[1px] text-muted-foreground" />
        </div>
      </div>
    </Card>
  );

  return to ? (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col"
    >
      {CardContent}
    </a>
  ) : (
    CardContent
  );
};
