import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch10CircuitsAndAC() {
  const chapter = getChapter('circuits-and-ac')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative, embedded demos, and FAQ coming up.</p>
    </ChapterShell>
  );
}
