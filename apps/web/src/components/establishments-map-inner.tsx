"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import type { MapPin } from "./establishments-map";

const yellowIcon = L.divIcon({
  className: "brava-pin",
  html: `<div style="
    width:34px;height:34px;border-radius:50% 50% 50% 0;
    background:#FBBF24;border:3px solid #1E3A8A;
    transform:rotate(-45deg);
    box-shadow:0 4px 12px rgba(0,0,0,.3);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);color:#0A0A0A;font-weight:900;font-size:20px;line-height:1;">+</span></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

const DEFAULT_CENTER: [number, number] = [-23.5615, -46.671];

export default function EstablishmentsMapInner({
  pins,
  height: _height,
}: {
  pins: MapPin[];
  height?: number | string;
}) {
  const center: [number, number] =
    pins.length > 0
      ? [
          pins.reduce((s, p) => s + p.lat, 0) / pins.length,
          pins.reduce((s, p) => s + p.lng, 0) / pins.length,
        ]
      : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin.slug} position={[pin.lat, pin.lng]} icon={yellowIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="font-bold text-sm">{pin.name}</p>
              {pin.city && (
                <p className="text-xs text-zinc-500">
                  {pin.city}/{pin.state ?? ""}
                </p>
              )}
              <Link
                href={`/app/estabelecimento/${pin.slug}`}
                className="inline-block rounded-full bg-brava-black px-3 py-1 text-xs font-bold text-white"
              >
                Ver detalhes →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
