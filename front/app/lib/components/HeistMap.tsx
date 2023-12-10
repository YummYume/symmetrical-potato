import { Map } from '@vis.gl/react-google-maps';

const defaultOptions: React.ComponentProps<typeof Map> = {
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
  zoom: 11,
  streetViewControl: false,
  mapTypeControl: false,
  zoomControl: true,
  fullscreenControl: false,
};

export default function HeistMap({
  options = {},
}: Readonly<{ options: React.ComponentProps<typeof Map> }>) {
  return <Map {...defaultOptions} {...options} />;
}
