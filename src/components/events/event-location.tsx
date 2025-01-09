import React from 'react'
import { Heading3 } from '../ui/heading-3'

type EventLocationProps = {
    latitude?: number | null;
    longitude?: number | null;
}

const EventLocation: React.FC<EventLocationProps> = ({ latitude, longitude }) => {
    return (
        <div>
            <Heading3 className="text-2xl font-semibold mt-4 mb-4">
                Ubicación del evento
            </Heading3>

            {
                (longitude && latitude) ? (
                    <div style={{ width: '100%', height: '400px' }}>
                        <iframe
                            src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>

                ) : (
                    <p className="w-full text-center text-sm text-muted-foreground mt-4">
                        Ubicación no disponible
                    </p>
                )
            }
        </div>
    )
}

export default EventLocation;
