'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';

type TestimonialActionButtonProps = {
  hasUserTestimonial: boolean;
  onClick: () => void;
};

export function TestimonialActionButton({
  hasUserTestimonial,
  onClick,
}: TestimonialActionButtonProps) {
  return (
    <Button variant="pcn" size="sm" onClick={onClick}>
      {hasUserTestimonial ? (
        <>
          <Edit className="mr-2 h-4 w-4" />
          editarTestimonio();
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          agregarTestimonio();
        </>
      )}
    </Button>
  );
}
