import React from 'react';
import { ChevronDown } from 'lucide-react';

export const ScrollArrow: React.FC = () => (
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
    <ChevronDown className="h-8 w-8 text-white" />
  </div>
);
