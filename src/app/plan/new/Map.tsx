"use client";

import { useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

interface MapProps {
  lat: number | null;
  lng: number | null;
  draggable?: boolean;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
}

export default function MapComponent({
  lat,
  lng,
  draggable = true,
  setLat,
  setLng,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Marcador emoji alfiler
  const markerIcon = L.divIcon({
    html: "📍",
    className: "text-2xl",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const handleDragEnd = (event: L.DragEndEvent) => {
    const newPos = event.target.getLatLng();
    setLat(newPos.lat);
    setLng(newPos.lng);
    if (mapRef.current) {
      mapRef.current.setView([newPos.lat, newPos.lng], mapRef.current.getZoom(), {
        animate: true,
      });
    }
  };  

  if (!lat || !lng) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500 bg-gray-100 rounded-xl">
        Cargando mapa...
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        ref={mapRef}
        whenReady={() => {
          // Centrar el mapa con el pin en cuanto carga
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15, { animate: true });
          }
        }}
      >
        <TileLayer
          // Cambia aquí según quieras labels negras o blancas
          url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />
        <Marker
          draggable={draggable}
          position={[lat, lng]}
          icon={markerIcon}
          eventHandlers={{ dragend: handleDragEnd }}
        />
      </MapContainer>
    </div>
  );
}
