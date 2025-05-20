'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setIsOpen(!isOpen)}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
} 