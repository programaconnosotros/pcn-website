import { TRIVIA_QUESTIONS } from './trivia-questions';

describe('offline trivia', () => {
  it('has unique questions, each with distinct options and an explanation', () => {
    const questions = TRIVIA_QUESTIONS.map((question) => question.question);
    expect(new Set(questions).size).toBe(questions.length);
    for (const question of TRIVIA_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.explanation.trim()).not.toBe('');
    }
  });
});
