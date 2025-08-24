"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface MapProps {
  lat: number | null;
  lng: number | null;
  place: string;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
  setPlace: (place: string) => void;
}

export default function MapComponent({ lat, lng, place, setLat, setLng, setPlace }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  const markerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Hooks siempre se llaman
  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;
    mapRef.current.invalidateSize();
    mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true });
  }, [lat, lng]);

  const handleDragEnd = async (event: L.DragEndEvent) => {
    const newPos = event.target.getLatLng();
    setLat(newPos.lat);
    setLng(newPos.lng);

    if (mapRef.current) {
      mapRef.current.setView([newPos.lat, newPos.lng], mapRef.current.getZoom(), { animate: true });
    }

    try {
      const resp = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${newPos.lat}&lon=${newPos.lng}&apiKey=d59ea046b89d4b76bbfda88186667ca7`
      );
      const geoData = await resp.json();
      const firstFeature = geoData.features?.[0];
      const city =
        firstFeature?.properties?.city ||
        firstFeature?.properties?.town ||
        firstFeature?.properties?.village ||
        "Ubicación aproximada";
      setPlace(city);
    } catch {
      setPlace("Ubicación aproximada");
    }
  };

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-md">
      {/* Render condicional dentro del JSX, hooks ya ejecutados */}
      {lat && lng ? (
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          <Marker draggable position={[lat, lng]} icon={markerIcon} eventHandlers={{ dragend: handleDragEnd }}>
            <Popup>{place}</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
          Cargando mapa...
        </div>
      )}
    </div>
  );
}
