import React from 'react';
import { ChevronDown } from 'lucide-react';

export const ScrollArrow: React.FC = () => (
  <div className="absolute bottom-8 flex transform animate-bounce flex-col items-center gap-2">
    <p className="text-xl">Scrolleá para ver más</p>
    <ChevronDown className="h-8 w-8 text-white" />
  </div>
);
