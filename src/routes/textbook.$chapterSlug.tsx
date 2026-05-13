import { createFileRoute, notFound } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getChapter } from '@/textbook/data/chapters';

const CHAPTER_MODULES: Record<string, ReturnType<typeof lazy>> = {
  'what-is-electricity':   lazy(() => import('@/textbook/Ch1WhatIsElectricity')),
  'voltage-and-current':   lazy(() => import('@/textbook/Ch2VoltageAndCurrent')),
  'resistance-and-power':  lazy(() => import('@/textbook/Ch3ResistanceAndPower')),
  'magnetism':             lazy(() => import('@/textbook/Ch4Magnetism')),
  'induction':             lazy(() => import('@/textbook/Ch5Induction')),
  'energy-flow':           lazy(() => import('@/textbook/Ch6EnergyFlow')),
  'em-waves':              lazy(() => import('@/textbook/Ch7EMWaves')),
  'maxwell':               lazy(() => import('@/textbook/Ch8Maxwell')),
  'relativity':            lazy(() => import('@/textbook/Ch9Relativity')),
  'circuits-and-ac':       lazy(() => import('@/textbook/Ch10CircuitsAndAC')),
  'materials':             lazy(() => import('@/textbook/Ch11Materials')),
};

export const Route = createFileRoute('/textbook/$chapterSlug')({
  beforeLoad: ({ params }) => {
    if (!getChapter(params.chapterSlug)) throw notFound();
  },
  component: ChapterRoute,
});

function ChapterRoute() {
  const { chapterSlug } = Route.useParams();
  const Chapter = CHAPTER_MODULES[chapterSlug];
  if (!Chapter) return <div style={{ padding: 80 }}>Chapter not found.</div>;
  return (
    <Suspense fallback={<div style={{ padding: 120 }}>Loading…</div>}>
      <Chapter />
    </Suspense>
  );
}
