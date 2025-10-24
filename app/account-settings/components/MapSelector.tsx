"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";

// Fix for default icon issue with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


interface AddressData {
  lat: number;
  lng: number;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface MapSelectorProps {
  onSelect: (address: AddressData) => void;
  onClose: () => void;
}

export default function MapSelector({ onSelect, onClose }: MapSelectorProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e: L.LeafletMouseEvent) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  };

  const handleSelect = async () => {
    if (position) {
      // Reverse geocode to get address details
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`);
      const data = await response.json();
      onSelect(data.address);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl h-4/5 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Select Address from Map</h2>
        <div className="flex-grow">
          <MapContainer center={[13.7563, 100.5018]} zoom={6} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
          </MapContainer>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 mr-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button onClick={handleSelect} disabled={!position} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400">Select</button>
        </div>
      </div>
    </div>
  );
}
