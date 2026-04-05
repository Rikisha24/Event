import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '@/lib/mockData';
import { IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface EventMapProps {
  events: Event[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function EventMap({ events, center = [12.9716, 77.5946], zoom = 12, className = 'h-[500px]' }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [ready, setReady] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;
    setReady(true);

    // Force a resize after mount to fix blank tiles
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center/zoom when props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom]);

  // Add/update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    events.forEach(event => {
      if (!event.lat || !event.lng) return;

      const marker = L.marker([event.lat, event.lng], { icon: defaultIcon }).addTo(map);

      const popupContent = `
        <div style="min-width:180px;font-family:system-ui,sans-serif;">
          <a href="/event/${event.id}" style="font-weight:600;font-size:13px;color:#7c3aed;text-decoration:none;">
            ${event.title}
          </a>
          <p style="font-size:11px;margin:4px 0 0;color:#64748b;">${event.venue}, ${event.city}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
            <span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:10px;">${event.category}</span>
            <span style="font-size:12px;font-weight:600;">₹${event.price}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, [events, ready]);

  return (
    <div ref={mapRef} className={`${className} rounded-xl z-0`} />
  );
}
