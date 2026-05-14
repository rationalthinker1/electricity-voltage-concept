import { ChapterShell } from '@/components/ChapterShell';
import { getChapter } from '@/textbook/data/chapters';

/**
 * Chapter stub — content will be authored in a follow-up pass.
 * The chapter is registered in the manifest with full SyllabusCard
 * metadata (objectives, prereqs, time-to-read, punchline), so /map
 * and /tracks already show it as part of the practical curriculum.
 */
export default function Ch38HouseSmartRetrofits() {
  const chapter = getChapter('house-smart-retrofits')!;
  return (
    <ChapterShell chapter={chapter}>
      <p>Chapter content is being written. The syllabus above describes the scope.</p>
    </ChapterShell>
  );
}
