import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch19RectifiersAndInverters() {
  const chapter = getChapter('rectifiers-and-inverters')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress.</p>
    </ChapterShell>
  );
}
