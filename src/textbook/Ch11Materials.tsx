import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch11Materials() {
  const chapter = getChapter('materials')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative, embedded demos, and FAQ coming up.</p>
    </ChapterShell>
  );
}
