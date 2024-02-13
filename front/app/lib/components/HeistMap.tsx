import { Map } from '@vis.gl/react-google-maps';

const defaultOptions: React.ComponentProps<typeof Map> = {
  defaultCenter: { lat: 40.758, lng: 73.9855 },
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
  defaultZoom: 14,
  maxZoom: 20,
  streetViewControl: false,
  mapTypeControl: false,
  zoomControl: true,
  fullscreenControl: false,
};

export default function HeistMap({
  options = {},
  children,
}: {
  options: React.ComponentProps<typeof Map>;
  children?: React.ReactNode;
}) {
  return (
    <Map {...defaultOptions} {...options}>
      {children}
    </Map>
  );
}
