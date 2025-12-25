'use client';

import { useRef, useMemo } from 'react';
import { Heading2 } from '@/components/ui/heading-2';
import { TestimonialActionButton } from '@/components/testimonials/testimonial-action-button';
import { TestimonialsClient, TestimonialsClientRef } from './testimonials-client';
import { Testimonial } from '@prisma/client';

type TestimonialWithUser = Testimonial & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type TestimonialsClientWrapperProps = {
  testimonials: TestimonialWithUser[];
  currentUserId?: string;
  isAdmin?: boolean;
  hasUserTestimonial?: boolean;
};

export function TestimonialsClientWrapper({
  testimonials,
  currentUserId,
  isAdmin,
  hasUserTestimonial,
}: TestimonialsClientWrapperProps) {
  const clientRef = useRef<TestimonialsClientRef>(null);

  // Encontrar el testimonio del usuario actual
  const userTestimonial = useMemo(() => {
    if (!currentUserId) return null;
    return testimonials.find((t) => t.userId === currentUserId) || null;
  }, [testimonials, currentUserId]);

  const handleButtonClick = () => {
    if (clientRef.current) {
      clientRef.current.openForm(hasUserTestimonial ? userTestimonial : null);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Heading2 className="m-0">Testimonios</Heading2>
        <TestimonialActionButton
          hasUserTestimonial={hasUserTestimonial || false}
          onClick={handleButtonClick}
        />
      </div>

      <TestimonialsClient
        ref={clientRef}
        testimonials={testimonials}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        hasUserTestimonial={hasUserTestimonial}
      />
    </>
  );
}

