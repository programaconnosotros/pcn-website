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
    <Button variant="pcn" onClick={onClick}>
      {hasUserTestimonial ? (
        <>
          <Edit className="mr-2 h-4 w-4" />
          Editar testimonio
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Agregar testimonio
        </>
      )}
    </Button>
  );
}

