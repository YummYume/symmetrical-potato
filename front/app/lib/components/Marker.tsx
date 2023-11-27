import { SpeakerLoudIcon } from '@radix-ui/react-icons';
import React from 'react';

interface MarkerProps {
  isLoud: boolean;
  className?: string;
  lat: number;
  lng: number;
  markerId: string;
  onClick?: (
    e: React.MouseEvent<SVGAElement, MouseEvent>,
    props: { lat: number; lng: number; markerId: string },
  ) => void;
}

export function Marker({ className, lat, lng, markerId, onClick, isLoud, ...props }: MarkerProps) {
  return lat && lng ? (
    <SpeakerLoudIcon
      className={className}
      onClick={(e: React.MouseEvent<SVGAElement, MouseEvent>) =>
        onClick ? onClick(e, { markerId, lat, lng }) : null
      }
      style={{ cursor: 'pointer', fontSize: 40 }}
      width={35}
      height={35}
      {...props}
    />
  ) : null;
}
