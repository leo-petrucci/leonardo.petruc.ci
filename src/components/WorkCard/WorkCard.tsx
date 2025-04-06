import React from 'react';
import { Card } from '../ui/card';
import { H2 } from '../ui/typography';

type WorkCardProps = {
  title: React.ReactNode;
  subTitle: React.ReactNode;
  companyLogo: string;
  companyName: React.ReactNode;
  bgColor: string;
};

/**
 * Renders a work card with a title, subtitle, company logo, and company name.
 * @param {string} bgColor - The background color of the card.
 * @param {string} companyLogo - The URL of the company logo.
 * @param {string} companyName - The name of the company.
 * @param {string} subTitle - The subtitle of the card.
 * @param {string} title - The title of the card.
 * @returns {JSX.Element} The rendered work card component.
 */
export const WorkCard = ({
  bgColor,
  companyLogo,
  companyName,
  subTitle,
  title,
}: WorkCardProps) => {
  return (
    <Card className={`p-4 shadow-sm`} style={{
        backgroundColor: bgColor,
    }}>
      <div className="flex flex-col gap-4 flex-1 h-full items-start">
        <div className="px-2 py-1 rounded bg-white text-muted-foreground uppercase flex-none text-xs">
          Work
        </div>
        <div className="flex flex-col gap-1">
          <H2 className="border-0 text-base font-medium p-0">{title}</H2>
          <span className="text-muted-foreground text-sm">{subTitle}</span>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <img src={companyLogo} className="h-[21px]" /> {companyName}
      </div>
    </Card>
  );
};
