import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch22MagneticallyCoupledCircuits() {
  const chapter = getChapter('magnetically-coupled-circuits')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress.</p>
    </ChapterShell>
  );
}
