"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface MapProps {
  lat: number;
  lng: number;
  place: string;
}

export default function MapComponent({ lat, lng, place }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const markerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  if (!mounted) return null;

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true} // activamos scroll
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{place}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
