"use client";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { useState, useCallback } from "react";

const libraries: "places"[] = ["places"];

interface GoogleMapWrapperProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  center: google.maps.LatLngLiteral | null;
}

export default function GoogleMapWrapper({
  onPlaceSelect,
  center,
}: GoogleMapWrapperProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            onPlaceSelect(results[0]);
          }
        });
      }
    },
    [onPlaceSelect],
  );

  return isLoaded ? (
    <div style={{ height: "300px", width: "100%", marginBottom: "1rem" }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center || { lat: 13.7563, lng: 100.5018 }}
        zoom={center ? 15 : 6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
      >
        {center && <Marker position={center} />}
      </GoogleMap>
    </div>
  ) : (
    <></>
  );
}
