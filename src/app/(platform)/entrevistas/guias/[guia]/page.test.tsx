import { render, screen } from '@testing-library/react';
import { InterviewGuide } from '@/components/interviews/interview-guide';
import { MISSING_TAB_TITLE } from '@/lib/tab-title';
import { allGuideIds, interviewGuides } from '../guides';
import GuiaPage, { dynamicParams, generateMetadata, generateStaticParams } from './page';

jest.mock('@/components/interviews/interview-guide', () => ({
  InterviewGuide: jest.fn(() => <div data-testid="guide" />),
}));

const params = (guia: string) => ({ params: Promise.resolve({ guia }) });

describe('GuiaPage', () => {
  it('pre-renders every guide and nothing else', () => {
    expect(generateStaticParams()).toEqual(allGuideIds.map((guia) => ({ guia })));
    expect(dynamicParams).toBe(false);
  });

  it('renders a track guide with its simulator link and courses', async () => {
    render(await GuiaPage(params('security')));
    expect(screen.getByTestId('guide')).toBeInTheDocument();
    expect(jest.mocked(InterviewGuide).mock.calls[0][0]).toMatchObject({
      guide: interviewGuides.security,
      practice: { href: '/entrevistas?tipo=security' },
      courses: expect.any(Array),
    });
  });

  it('renders the cross-track live coding guide', async () => {
    render(await GuiaPage(params('live-coding')));
    expect(jest.mocked(InterviewGuide).mock.calls[0][0]).toMatchObject({
      label: 'Live coding',
      practice: { href: '/entrevistas/live-coding' },
    });
  });

  it('is not found for an unknown guide', async () => {
    await expect(GuiaPage(params('cobol'))).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('builds the metadata from the guide', async () => {
    const metadata = await generateMetadata(params('react'));
    expect(metadata.description).toBe(interviewGuides.react.summary);
    expect(metadata.title).toMatch(/entrevistas\/guias/);
    expect(metadata.openGraph).toMatchObject({
      title: expect.stringMatching(/^Guía de entrevista: .+ \| programaConNosotros$/),
      url: expect.stringMatching(/\/entrevistas\/guias\/react$/),
      type: 'article',
    });
  });

  it('titles an unknown guide as missing', async () => {
    expect(await generateMetadata(params('cobol'))).toEqual({
      title: { absolute: MISSING_TAB_TITLE },
    });
  });
});
