'use client';

import { createFileRoute } from '@tanstack/react-router';
import { DitherizerApp } from '@/components/Ditherizer/DitherizerApp';

export const Route = createFileRoute('/apps/ditherizer/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DitherizerApp />;
}
