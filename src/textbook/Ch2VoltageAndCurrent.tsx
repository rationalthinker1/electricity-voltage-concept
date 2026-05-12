import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch2VoltageAndCurrent() {
  const chapter = getChapter('voltage-and-current')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative and embedded demos coming up.</p>
    </ChapterShell>
  );
}
