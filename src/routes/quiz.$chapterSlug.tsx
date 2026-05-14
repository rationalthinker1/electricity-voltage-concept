import { Link, createFileRoute, notFound } from '@tanstack/react-router';

import { Quiz } from '@/components/Quiz';
import { Banner } from '@/components/ui';
import { getChapter, type ChapterSlug } from '@/textbook/data/chapters';
import { getQuiz } from '@/textbook/data/quizzes';

export const Route = createFileRoute('/quiz/$chapterSlug')({
  beforeLoad: ({ params }) => {
    if (!getChapter(params.chapterSlug)) throw notFound();
  },
  component: QuizRoute,
});

function QuizRoute() {
  const { chapterSlug } = Route.useParams();
  const chapter = getChapter(chapterSlug);
  if (!chapter) {
    return <div style={{ padding: 80 }}>Chapter not found.</div>;
  }
  const slug = chapter.slug as ChapterSlug;
  const quiz = getQuiz(slug);

  return (
    <article className="chapter-page">
      <div className="chapter-eyebrow">Mastery quiz &middot; Chapter {chapter.number}</div>
      <h1 dangerouslySetInnerHTML={{ __html: chapter.title }} />
      <p className="chap-deck">
        Answer the questions below to verify chapter mastery. Pass at the configured threshold and the
        chapter is marked complete in your progress.
      </p>

      <div style={{ margin: '20px 0' }}>
        <Link
          to="/textbook/$chapterSlug"
          params={{ chapterSlug: chapter.slug }}
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          ← Back to the chapter
        </Link>
      </div>

      {quiz ? (
        <Quiz chapterSlug={slug} />
      ) : (
        <Banner variant="info">
          No quiz has been written for this chapter yet. Check back soon — quizzes are being rolled
          out chapter by chapter.
        </Banner>
      )}
    </article>
  );
}
