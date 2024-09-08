import { Heading2 } from '@/components/ui/heading-2';

const GitAndGitHubCourse = () => (
  <div className="mt-4 md:px-20">
    <Heading2>Git & GitHub</Heading2>

    <div className="mt-4 w-full" style={{ aspectRatio: '16/9' }}>
      <iframe
        className="h-full w-full"
        src="https://www.youtube.com/embed/WlB2fzl1vO8?si=O3O4Mi-gU65x2eyJ&vq=hd1080"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  </div>
);

export default GitAndGitHubCourse;
