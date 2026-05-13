import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch14Semiconductors() {
  const chapter = getChapter('semiconductors')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress.</p>
    </ChapterShell>
  );
}
