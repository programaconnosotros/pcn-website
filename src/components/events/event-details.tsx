import React from 'react';
import { Heading3 } from '../ui/heading-3';

const EventDetails: React.FC<{ description: string }> = ({ description }) => {
  return (
    <>
      <Heading3 className="mb-4 mt-4 text-2xl font-semibold">Detalles del evento</Heading3>

      <p className="mt-2 text-center text-lg">{description}</p>
    </>
  );
};

export default EventDetails;
