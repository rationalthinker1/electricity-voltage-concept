import { createFileRoute, notFound } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getChapter } from '@/textbook/data/chapters';

const CHAPTER_MODULES: Record<string, ReturnType<typeof lazy>> = {
  'what-is-electricity':   lazy(() => import('@/textbook/Ch1WhatIsElectricity')),
  'voltage-and-current':   lazy(() => import('@/textbook/Ch2VoltageAndCurrent')),
  'resistance-and-power':  lazy(() => import('@/textbook/Ch3ResistanceAndPower')),
  'how-a-resistor-works':  lazy(() => import('@/textbook/Ch4HowAResistorWorks')),
  'capacitors':            lazy(() => import('@/textbook/Ch5Capacitors')),
  'magnetism':             lazy(() => import('@/textbook/Ch6Magnetism')),
  'induction':             lazy(() => import('@/textbook/Ch7Induction')),
  'energy-flow':           lazy(() => import('@/textbook/Ch8EnergyFlow')),
  'em-waves':              lazy(() => import('@/textbook/Ch9EMWaves')),
  'maxwell':               lazy(() => import('@/textbook/Ch10Maxwell')),
  'relativity':            lazy(() => import('@/textbook/Ch11Relativity')),
  'circuits-and-ac':       lazy(() => import('@/textbook/Ch12CircuitsAndAC')),
  'materials':             lazy(() => import('@/textbook/Ch13Materials')),
  'optics':                lazy(() => import('@/textbook/Ch14Optics')),
  'antennas':              lazy(() => import('@/textbook/Ch15Antennas')),
  'motors':                lazy(() => import('@/textbook/Ch16Motors')),
  'generators':            lazy(() => import('@/textbook/Ch17Generators')),
  'batteries':             lazy(() => import('@/textbook/Ch18Batteries')),
  'modern-batteries':      lazy(() => import('@/textbook/Ch19ModernBatteries')),
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
