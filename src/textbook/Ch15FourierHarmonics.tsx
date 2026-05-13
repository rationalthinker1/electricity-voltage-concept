import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch15FourierHarmonics() {
  const chapter = getChapter('fourier-harmonics')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress.</p>
    </ChapterShell>
  );
}
