"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { createClient } from "@/lib/supabase/browser";
import type { DeliveryMapProps } from "./delivery-map";

function pinIcon(color: string, emoji: string) {
  return L.divIcon({
    className: "brava-delivery-pin",
    html: `<div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid #0A0A0A;
      transform:rotate(-45deg);
      box-shadow:0 4px 14px rgba(0,0,0,.45);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:18px;line-height:1;">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
}

const PICKUP_ICON = pinIcon("#FBBF24", "📦");
const DROPOFF_ICON = pinIcon("#1E3A8A", "🏠");
const COURIER_ICON = pinIcon("#22c55e", "🛵");

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds.pad(0.2));
  }, [map, points]);
  return null;
}

export default function DeliveryMapInner({
  pickup,
  dropoff,
  currentDeliverer,
  routePolyline,
  trackingDeliveryId,
  trackingDelivererId,
}: DeliveryMapProps) {
  const [livePos, setLivePos] = useState<{ lat: number; lng: number } | null>(currentDeliverer ?? null);
  const lastPingAt = useRef<number>(0);

  // Modo entregador: usa watchPosition do navegador
  useEffect(() => {
    if (!trackingDeliveryId || !trackingDelivererId) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const supabase = createClient();
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, speed, heading, accuracy } = pos.coords;
        setLivePos({ lat: latitude, lng: longitude });
        const now = Date.now();
        // throttle: 1 ping a cada 8s
        if (now - lastPingAt.current < 8000) return;
        lastPingAt.current = now;
        try {
          await supabase.from("delivery_tracking_pings").insert({
            delivery_id: trackingDeliveryId,
            deliverer_id: trackingDelivererId,
            lat: latitude,
            lng: longitude,
            speed_kmh: speed != null ? speed * 3.6 : null,
            heading: heading ?? null,
            accuracy_m: accuracy ?? null,
          });
          await supabase
            .from("deliverers")
            .update({ current_lat: latitude, current_lng: longitude, last_seen_at: new Date().toISOString() })
            .eq("id", trackingDelivererId);
        } catch {
          /* silent */
        }
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [trackingDeliveryId, trackingDelivererId]);

  // Modo cliente: subscribe a pings em tempo real
  useEffect(() => {
    if (trackingDeliveryId || trackingDelivererId) return;
    if (!currentDeliverer) return;
    const supabase = createClient();

    // Assume que estamos observando a delivery via prop passada (cliente)
    // O parent precisa fornecer o id via algum canal; nesse caso, dependo do `currentDeliverer` inicial e atualizo a partir dele.
  }, [currentDeliverer, trackingDeliveryId, trackingDelivererId]);

  const center: [number, number] = livePos
    ? [livePos.lat, livePos.lng]
    : [(pickup.lat + dropoff.lat) / 2, (pickup.lng + dropoff.lng) / 2];

  const bounds: [number, number][] = [
    [pickup.lat, pickup.lng],
    [dropoff.lat, dropoff.lng],
    ...(livePos ? [[livePos.lat, livePos.lng] as [number, number]] : []),
  ];

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={bounds} />

      <Marker position={[pickup.lat, pickup.lng]} icon={PICKUP_ICON}>
        <Popup>📦 Coleta<br />{pickup.label}</Popup>
      </Marker>
      <Marker position={[dropoff.lat, dropoff.lng]} icon={DROPOFF_ICON}>
        <Popup>🏠 Entrega<br />{dropoff.label}</Popup>
      </Marker>
      {livePos && (
        <Marker position={[livePos.lat, livePos.lng]} icon={COURIER_ICON}>
          <Popup>🛵 Entregador</Popup>
        </Marker>
      )}

      {routePolyline && routePolyline.length > 1 && (
        <Polyline positions={routePolyline} pathOptions={{ color: "#1E3A8A", weight: 5, opacity: 0.7 }} />
      )}
    </MapContainer>
  );
}
