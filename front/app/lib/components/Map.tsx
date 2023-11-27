import { SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons';
import GoogleMapReact from 'google-map-react';
import { useState } from 'react';

import type { MapOptions } from 'google-map-react';
import type { Coords } from 'google-map-react';

type MarkerProps = { isLoud: boolean } & Coords;

function Marker({ isLoud }: MarkerProps) {
  return isLoud ? <SpeakerLoudIcon /> : <SpeakerOffIcon />;
}

export default function Map({ apiKey }: { apiKey: string }) {
  const [bounds, setBounds] = useState<{ lat: number; lng: number }>({
    lat: 40.759,
    lng: -73.9845,
  });

  const mapOptions = {
    zoom: 11,
    center: { lat: 40.758, lng: 73.9855 },
    restriction: {
      latLngBounds: {
        north: 40.9176,
        south: 40.4774,
        east: -73.7002,
        west: -74.0431,
      },
      strictBounds: true,
    },
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [
          {
            visibility: '#on',
          },
        ],
      },
    ],
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: apiKey,
          libraries: ['places'],
        }}
        defaultCenter={mapOptions.center}
        defaultZoom={mapOptions.zoom}
        center={bounds}
        options={mapOptions as MapOptions}
        yesIWantToUseGoogleMapApiInternals
        onClick={({ lat, lng }) => {
          console.log(lat, lng);
          setBounds({ ...bounds, lat, lng });
        }}
      >
        <Marker lat={40.81595252205852} lng={-74.01374590454101} isLoud />
      </GoogleMapReact>
    </div>
  );
}
