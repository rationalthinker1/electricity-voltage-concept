import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch14Optics() {
  const chapter = getChapter('optics')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative, demos, case studies, FAQ, TryIts, and Term tags coming up.</p>
    </ChapterShell>
  );
}
