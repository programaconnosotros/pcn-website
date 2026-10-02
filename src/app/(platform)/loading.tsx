import { PcnLoader } from '@/components/ui/pcn-loader';

const Loading = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <PcnLoader />
  </div>
);

export default Loading;
