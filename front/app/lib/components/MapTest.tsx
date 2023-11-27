import GoogleMap from 'google-maps-react-markers';
import { useRef, useState } from 'react';

import { Marker } from './Marker';

import type { onGoogleApiLoadedProps } from 'google-maps-react-markers';

export function MapTest({ apiKey }: { apiKey: string }) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const mapOptions = {
    zoom: 1,
    center: { lat: 40.758, lng: 73.9855 },
    mapTypeControl: false,
    streetViewControl: false,
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
  const onGoogleApiLoaded = ({ map, maps }: onGoogleApiLoadedProps) => {
    console.log('Google API loaded', map, maps);
    mapRef.current = map;
    setMapReady(true);
  };

  // const onMarkerClick = (e, { markerId, lat, lng }) => {
  //   console.log('This is ->', markerId);

  //   // inside the map instance you can call any google maps method
  //   mapRef.current.setCenter({ lat, lng });
  //   // ref. https://developers.google.com/maps/documentation/javascript/reference?hl=it
  // };

  return (
    <>
      <GoogleMap
        apiKey={apiKey}
        defaultCenter={mapOptions.center}
        defaultZoom={mapOptions.zoom}
        options={mapOptions}
        libraries={['places']}
        mapMinHeight="100vh"
        onGoogleApiLoaded={onGoogleApiLoaded}
        onChange={(map) => console.log('Map moved', map)}
        events={[{ name: 'onClick', handler: (e) => console.log(e) }]}
      >
        <Marker
          markerId={'bob'}
          lat={40.81595252205852}
          lng={-74.01374590454101}
          isLoud
          onClick={() => console.log('icon')}
        />
      </GoogleMap>
    </>
  );
}
