import { useState } from 'react';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { CornerButton } from '@/components/atoms/CornerButton';
import { DitherField } from '@/components/organisms/DitherField';

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  href: string;
}

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <AsciiBox
      frameColor="var(--border)"
      labelColor="var(--accent)"
      fill
      reveal={{ trigger: 'inView' }}
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute top-2 left-1 right-2 bottom-3">
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
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <img src="/pixel-icons/newspaper32x.png" className="object-contain" />
            <h3>{article.title}</h3>
          </div>
          <p className="text-ascii-sm line-clamp-2">{article.excerpt}</p>
        </div>
        <CornerButton compact>READ</CornerButton>
      </div>
    </AsciiBox>
  );
}
