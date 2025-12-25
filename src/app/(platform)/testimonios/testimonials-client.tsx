'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { TestimonialCard } from '@/components/testimonials/testimonial-card';
import { TestimonialForm } from '@/components/testimonials/testimonial-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Testimonial } from '@prisma/client';

type TestimonialWithUser = Testimonial & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type TestimonialsClientProps = {
  testimonials: TestimonialWithUser[];
  currentUserId?: string;
  isAdmin?: boolean;
  hasUserTestimonial?: boolean;
};

export type TestimonialsClientRef = {
  openForm: (testimonial: Testimonial | null) => void;
};

export const TestimonialsClient = forwardRef<TestimonialsClientRef, TestimonialsClientProps>(
  ({ testimonials, currentUserId, isAdmin }, ref) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    // Exponer función para abrir el modal desde el botón externo
    const openForm = (testimonial: Testimonial | null) => {
      setEditingTestimonial(testimonial);
      setIsFormOpen(true);
    };

    useImperativeHandle(ref, () => ({
      openForm,
    }));

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
  };

  return (
    <>

      {testimonials.length === 0 ? (
        <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aún no hay testimonios. Sé el primero en compartir tu experiencia.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Editar testimonio' : 'Nuevo testimonio'}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? 'Modifica tu testimonio y comparte tu experiencia actualizada.'
                : 'Comparte tu experiencia con la comunidad de programaConNosotros.'}
            </DialogDescription>
          </DialogHeader>
          <TestimonialForm
            defaultValues={
              editingTestimonial
                ? {
                    body: editingTestimonial.body,
                  }
                : undefined
            }
            testimonialId={editingTestimonial?.id}
            onCancel={handleCancel}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
  },
);

TestimonialsClient.displayName = 'TestimonialsClient';

