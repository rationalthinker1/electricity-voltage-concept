import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch4Capacitors() {
  const chapter = getChapter('capacitors')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter draft in progress — narrative, build-a-capacitor demo, and FAQ coming up.</p>
    </ChapterShell>
  );
}
