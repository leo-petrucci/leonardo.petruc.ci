import maplibregl from 'maplibre-gl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const InfoItem = ({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>) => {
  return (
    <span className={cn('text-xs text-ring', className)} {...props}>
      {children}
    </span>
  );
};

export const InfoMap = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <InfoItem className="items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="flex flex-row gap-2 cursor-pointer hover:underline"
          onMouseEnter={() => setIsOpen(true)} // Open on hover
          onMouseLeave={() => setIsOpen(false)} // Close on hover out
        >
          Glasgow, UK <SquareArrowOutUpRight className="w-3 h-3 mt-[1px]" />
        </PopoverTrigger>
        <MapPopoverContent />
      </Popover>
    </InfoItem>
  );
};

const MapPopoverContent = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-4.2583, 55.8617], // Glasgow coordinates
      zoom: 10,
      attributionControl: false, // Disable attribution control
    });

    // Create a custom marker element
    const markerElement = document.createElement('div');
    markerElement.style.width = '12px';
    markerElement.style.height = '12px';
    markerElement.style.backgroundColor = '#4285F4'; // Google Maps blue
    markerElement.style.borderRadius = '50%';
    markerElement.style.boxShadow = '0 0 6px rgba(0, 0, 0, 0.3)';
    markerElement.style.border = '2px solid white';

    // Add the custom marker to the map
    new maplibregl.Marker({ element: markerElement })
      .setLngLat([-4.2583, 55.8617]) // Glasgow coordinates
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [visible]);

  return (
    <PopoverContent className="w-64 h-64 p-0">
      <div
        ref={(ref) => {
          mapContainerRef.current = ref;
          setVisible(!!ref);
        }}
        className="w-full h-full rounded-md"
      />
    </PopoverContent>
  );
};
