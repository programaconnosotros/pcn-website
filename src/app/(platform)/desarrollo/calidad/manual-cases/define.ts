import {
  qualityAreas,
  type QualityAreaId,
  type TestCase,
  type TestCasePriority,
} from '../quality-areas';

export type ManualCaseInput = {
  title: string;
  priority: TestCasePriority;
  /** State the tester needs before starting (user role, data, environment). */
  pre?: string[];
  steps: string[];
  expected: string;
};

// Numbers the cases of one area in order: TC-AUT-001, TC-AUT-002… Add new cases at the end of
// their area so existing ids never change.
export const defineManualCases = (area: QualityAreaId, cases: ManualCaseInput[]): TestCase[] => {
  const code = qualityAreas.find((a) => a.id === area)!.code;
  return cases.map((c, i) => ({
    id: `TC-${code}-${String(i + 1).padStart(3, '0')}`,
    title: c.title,
    area,
    type: 'manual',
    priority: c.priority,
    preconditions: c.pre ?? [],
    steps: c.steps,
    expected: c.expected,
  }));
};
