import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CornerButton } from '@/components/atoms/CornerButton';
import { DitherField } from '@/components/organisms/DitherField';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ArticleType = 'writing' | 'project';

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  href: string;
  /** External url. When set the card opens this in a new tab instead of the article page. */
  link?: string;
  type: ArticleType;
}

const TYPE_META: Record<
  ArticleType,
  { icon: string; label: string; tooltip: string }
> = {
  writing: {
    icon: '/pixel-icons/newspaper24x.png',
    label: 'writing',
    tooltip: 'writing — an article or post',
  },
  project: {
    icon: '/pixel-icons/terminal24x.png',
    label: 'project',
    tooltip: 'project — a code repo or built thing',
  },
};

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[article.type];
  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pointer-events-none absolute -inset-3">
        <DitherField
          color="#ffffff"
          className="absolute inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-10"
          angle={270}
          noise={0.25}
          speed={0.15}
          pixelSize={3}
          paused={!hovered}
        />
      </div>
      <div className="grid flex-1 grid-cols-[1fr_auto] grid-rows-[1fr_auto] gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <img
                  src={meta.icon}
                  alt={meta.label}
                  className="object-contain cursor-help"
                />
              </TooltipTrigger>
              <TooltipContent>{meta.tooltip}</TooltipContent>
            </Tooltip>
            <h3 className="text-balance">{article.title}</h3>
          </div>
          <p className="text-ascii-sm text-pretty line-clamp-2 min-h-[2lh] break-words">
            {article.excerpt}
          </p>
        </div>
        <div aria-hidden />
        <div aria-hidden />
        {article.link ? (
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="justify-self-end self-end"
          >
            <CornerButton compact>VIEW</CornerButton>
          </a>
        ) : (
          <Link to={article.href} className="justify-self-end self-end">
            <CornerButton compact>READ</CornerButton>
          </Link>
        )}
      </div>
    </div>
  );
}
