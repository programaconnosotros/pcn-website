'use client';

import { useRef, useMemo } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { TestimonialActionButton } from '@/components/testimonials/testimonial-action-button';
import { TestimonialsClient, TestimonialsClientRef } from './testimonials-client';
import { Testimonial } from '@prisma/client';

type TestimonialWithUser = Testimonial & {
  user: {
    id: string;
    name: string;
    image: string | null;
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
      <StickyHeader>
        <div className="mb-4 flex items-start justify-between gap-4">
          <PageTitle
            path="testimonios"
            meta={`${testimonials.length} testimonios de la comunidad`}
            className="mb-0 flex-1"
          />
          {currentUserId && (
            <TestimonialActionButton
              hasUserTestimonial={hasUserTestimonial || false}
              onClick={handleButtonClick}
            />
          )}
        </div>
      </StickyHeader>

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
