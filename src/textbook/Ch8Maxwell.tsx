import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch8Maxwell() {
  const chapter = getChapter('maxwell')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative, embedded demos, and FAQ coming up.</p>
    </ChapterShell>
  );
}
