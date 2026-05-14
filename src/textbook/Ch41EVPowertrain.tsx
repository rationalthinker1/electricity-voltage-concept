import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

export default function Ch41EVPowertrain() {
  const chapter = getChapter('ev-powertrain')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter content is being written. The syllabus above describes the scope.</p>
    </ChapterShell>
  );
}
