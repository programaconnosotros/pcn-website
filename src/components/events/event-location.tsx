import React from 'react';
import { Heading3 } from '../ui/heading-3';

type EventLocationProps = {
  latitude?: number | null;
  longitude?: number | null;
  city: string;
  address: String;
  placeName: String;
};

const EventLocation: React.FC<EventLocationProps> = ({
  latitude,
  longitude,
  city,
  address,
  placeName,
}) => (
  <div>
    <Heading3 className="mb-4 mt-4 text-2xl font-semibold">Ubicación del evento</Heading3>

    <p className="p-1 text-lg">Será en esta ciudad:</p>
    <p>
      <strong>{city}</strong>
    </p>
    <p className="p-1 text-lg">En este lugar:</p>
    <p>
      <strong>{placeName}</strong>
    </p>
    <p className="p-1 text-lg">Te dejamos la dirección a mano:</p>
    <p>
      <strong>{address}</strong>
    </p>

    <Heading3 className="mt-4">Mapa</Heading3>
    {longitude && latitude ? (
      <>
        <div className="mt-4" style={{ width: '100%', height: '400px' }}>
          <iframe
            src={`https://www.google.com/maps?q=${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}&z=15&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </>
    ) : (
      <p className="mt-4 w-full text-center text-sm text-muted-foreground">
        Ubicación en mapa no disponible
      </p>
    )}
  </div>
);

export default EventLocation;
