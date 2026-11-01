import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button, Progress, Tag } from '../components/ui';
import { formatTime, LESSONS, type Lesson } from '../content/lessons';
import type { Section } from '../content/types';
import type { LessonProgress } from '../state/schema';
import { useApp } from '../state/store';
import '../styles/lessons.css';

const SECTIONS: { id: Section; name: string }[] = [
  { id: 'VARC', name: 'Verbal ability and reading' },
  { id: 'DILR', name: 'Data interpretation and logical reasoning' },
  { id: 'QA', name: 'Quantitative ability' },
];

function progressOf(lesson: Lesson, p: LessonProgress | undefined): number {
  if (!p) return 0;
  return p.done ? 1 : Math.min(1, p.position / lesson.durationSeconds);
}

function LessonCard({ lesson, progress }: { lesson: Lesson; progress: LessonProgress | undefined }) {
  const answered = Object.keys(progress?.practice ?? {}).length;
  return (
    <li>
      <Link to={`/learn/lessons/${lesson.id}`} className="card card-link ll-card">
        <div className="row-between ll-card-head">
          <h4 className="card-title">{lesson.title}</h4>
          {progress?.done && <Tag tone="ok">Done</Tag>}
        </div>
        <p className="small muted">{lesson.summary}</p>
        <div className="ll-meta small muted">
          <span className="row num">
            <Clock size={14} strokeWidth={1.5} aria-hidden />
            {formatTime(lesson.durationSeconds)}
          </span>
          <span>
            {answered} of {lesson.practice.length} practice questions
          </span>
        </div>
        <Progress value={progressOf(lesson, progress)} label={`Progress in ${lesson.title}`} />
      </Link>
    </li>
  );
}

export default function Lessons() {
  const progress = useApp((s) => s.lessons);
  const doneCount = LESSONS.filter((l) => progress[l.id]?.done).length;
  const started = LESSONS.find((l) => !progress[l.id]?.done && (progress[l.id]?.position ?? 0) > 0);
  const next = started ?? LESSONS.find((l) => !progress[l.id]?.done);

  return (
    <div className="stack-lg">
      <div className="row-between">
        <p className="muted">
          {started
            ? `You stopped at ${formatTime(progress[started.id].position)} in ${started.title}.`
            : `${LESSONS.length} short lessons, each with a transcript and practice. ${doneCount} done so far.`}
        </p>
        {next && (
          <Button variant="primary" to={`/learn/lessons/${next.id}`}>
            {started ? 'Continue' : doneCount ? 'Next lesson' : 'Start the first lesson'}
          </Button>
        )}
      </div>
      {SECTIONS.map((section) => {
        const lessons = LESSONS.filter((l) => l.section === section.id);
        const topics = [...new Set(lessons.map((l) => l.topic))];
        return (
          <section key={section.id} className="stack" aria-labelledby={`ll-${section.id}`}>
            <h2 id={`ll-${section.id}`} className="section-title">
              {section.name}
            </h2>
            <div className="ll-topics">
              {topics.map((topic) => (
                <div key={topic} className="ll-topic">
                  <h3 className="label">{topic}</h3>
                  <ul className="ll-list">
                    {lessons
                      .filter((l) => l.topic === topic)
                      .map((l) => (
                        <LessonCard key={l.id} lesson={l} progress={progress[l.id]} />
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
