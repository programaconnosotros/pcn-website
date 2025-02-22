import { ChevronDown } from 'lucide-react';

export const ScrollArrow = () => (
  <div className="absolute bottom-8 flex transform animate-bounce flex-col items-center gap-2">
    <ChevronDown className="h-8 w-8 text-white" />
  </div>
);
