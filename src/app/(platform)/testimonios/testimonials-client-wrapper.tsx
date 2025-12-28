'use client';

import { useRef, useMemo } from 'react';
import { Heading2 } from '@/components/ui/heading-2';
import { Quote } from 'lucide-react';
import { TestimonialActionButton } from '@/components/testimonials/testimonial-action-button';
import { TestimonialsClient, TestimonialsClientRef } from './testimonials-client';
import { Testimonial } from '@prisma/client';

type TestimonialWithUser = Testimonial & {
  user: {
    id: string;
    name: string;
    email: string;
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
      <div className="mb-6 flex items-center justify-between">
        <Heading2 className="m-0 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
            <Quote className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
          </div>
          <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Testimonios</span>
        </Heading2>
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
