import {
  getInterviewQuestions,
  interviewQuestions,
  SENIORITIES,
  TRACK_TOOLS,
  TRACKS,
  trackQuestionCount,
  trackToolQuestions,
} from '.';

const tracksWithTools = TRACKS.filter(({ id }) => TRACK_TOOLS[id]).map(({ id }) => id);

describe('interview questions', () => {
  it.each(TRACKS.map(({ id }) => id))('%s has questions for every seniority', (track) => {
    for (const { id } of SENIORITIES) {
      expect(interviewQuestions[track][id].length).toBeGreaterThan(0);
    }
  });

  it.each(tracksWithTools)('%s has a question bank for every tool', (track) => {
    for (const { id: tool } of TRACK_TOOLS[track]!.tools) {
      for (const { id } of SENIORITIES) {
        expect(trackToolQuestions[tool][id].length).toBeGreaterThan(0);
      }
    }
  });

  it.each(tracksWithTools)('%s adds the selected tools to the general questions', (track) => {
    const [first] = TRACK_TOOLS[track]!.tools;
    const general = getInterviewQuestions(track, 'junior');
    const withTool = getInterviewQuestions(track, 'junior', undefined, [first.id]);

    expect(general).toEqual(interviewQuestions[track].junior);
    expect(withTool).toEqual([...general, ...trackToolQuestions[first.id].junior]);
  });

  // Questions are React keys in the simulator, so a full deck can't repeat one.
  it.each(TRACKS.map(({ id }) => id))('%s never repeats a question in a deck', (track) => {
    const tools = TRACK_TOOLS[track]?.tools.map(({ id }) => id) ?? [];
    for (const { id } of SENIORITIES) {
      const deck = getInterviewQuestions(
        track,
        id,
        { automated: true, tools: ['cypress', 'playwright', 'k6'] },
        tools,
      ).map(({ question }) => question);
      expect(new Set(deck).size).toBe(deck.length);
    }
  });

  it('counts the tool banks in the track total', () => {
    for (const track of tracksWithTools) {
      const all = SENIORITIES.flatMap(({ id }) =>
        getInterviewQuestions(
          track,
          id,
          undefined,
          TRACK_TOOLS[track]!.tools.map((tool) => tool.id),
        ),
      );
      expect(trackQuestionCount(track)).toBe(all.length);
    }
  });
});
