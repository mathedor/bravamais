"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import type { RouteMapProps } from "./route-map";

function numberedIcon(n: number) {
  return L.divIcon({
    className: "brava-numbered-pin",
    html: `<div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      background:#FBBF24;border:3px solid #0A0A0A;
      transform:rotate(-45deg);
      box-shadow:0 4px 14px rgba(0,0,0,.45);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:14px;font-weight:900;color:#0A0A0A;">${n}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

const COURIER_ICON = L.divIcon({
  className: "brava-courier-pin",
  html: `<div style="
    width:38px;height:38px;border-radius:50%;
    background:#22c55e;border:3px solid #0A0A0A;
    box-shadow:0 4px 14px rgba(0,0,0,.45);
    display:flex;align-items:center;justify-content:center;
    font-size:18px;
  ">🛵</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function FitToRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points.map((p) => L.latLng(p[0], p[1]))).pad(0.15));
  }, [map, points]);
  return null;
}

export default function RouteMapInner({ origin, stops, polyline }: RouteMapProps) {
  const points: [number, number][] = [
    [origin.lat, origin.lng],
    ...stops.map((s) => [s.lat, s.lng] as [number, number]),
  ];

  return (
    <MapContainer center={[origin.lat, origin.lng]} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToRoute points={polyline.length > 1 ? polyline : points} />

      <Marker position={[origin.lat, origin.lng]} icon={COURIER_ICON}>
        <Popup>Você está aqui</Popup>
      </Marker>

      {stops.map((s, i) => (
        <Marker key={`${s.lat}-${s.lng}-${i}`} position={[s.lat, s.lng]} icon={numberedIcon(i + 1)}>
          <Popup>
            <strong>#{i + 1}</strong>
            <br />
            {s.label}
          </Popup>
        </Marker>
      ))}

      {polyline.length > 1 && (
        <Polyline positions={polyline} pathOptions={{ color: "#1E3A8A", weight: 5, opacity: 0.75 }} />
      )}
    </MapContainer>
  );
}
