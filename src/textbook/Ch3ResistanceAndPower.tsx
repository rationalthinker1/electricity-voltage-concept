import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch3ResistanceAndPower() {
  const chapter = getChapter('resistance-and-power')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative and embedded demos coming up.</p>
    </ChapterShell>
  );
}
