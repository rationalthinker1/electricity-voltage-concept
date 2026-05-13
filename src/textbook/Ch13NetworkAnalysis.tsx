import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch13NetworkAnalysis() {
  const chapter = getChapter('network-analysis')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress.</p>
    </ChapterShell>
  );
}
