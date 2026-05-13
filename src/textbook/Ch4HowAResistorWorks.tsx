import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch4HowAResistorWorks() {
  const chapter = getChapter('how-a-resistor-works')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative, build-a-resistor demo, color-code decoder, and FAQ coming up.</p>
    </ChapterShell>
  );
}
