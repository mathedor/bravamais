"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { DeliveryMap } from "@/components/delivery-map";

interface Props {
  deliveryId: string;
  delivererId: string | null;
  pickup: { lat: number; lng: number; label: string };
  dropoff: { lat: number; lng: number; label: string };
  initialDelivererPos?: { lat: number; lng: number } | null;
}

export function RealtimeTracker(props: Props) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(props.initialDelivererPos ?? null);

  useEffect(() => {
    if (!props.delivererId) return;
    const supabase = createClient();

    // Realtime listening em delivery_tracking_pings
    const channel = supabase
      .channel(`delivery-${props.deliveryId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_tracking_pings",
          filter: `delivery_id=eq.${props.deliveryId}`,
        },
        (payload) => {
          const row = payload.new as { lat: number; lng: number };
          setPos({ lat: row.lat, lng: row.lng });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [props.deliveryId, props.delivererId]);

  return (
    <DeliveryMap
      pickup={props.pickup}
      dropoff={props.dropoff}
      currentDeliverer={pos ? { lat: pos.lat, lng: pos.lng } : null}
      height={300}
    />
  );
}
