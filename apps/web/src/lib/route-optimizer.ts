/**
 * Otimizador de rota multi-stop via Google Directions API.
 * Recebe origem fixa (atual), waypoints (cada destino de entrega) e retorna
 * a ordem otimizada + polyline pra renderizar no mapa.
 *
 * Falha silenciosa: se a key não existir ou a API responder erro, retorna
 * a ordem original e nenhum polyline — UI cai pra fallback simples.
 */

export interface RouteStop {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

export interface OptimizedRoute {
  orderedStopIds: string[];
  polyline: [number, number][];
  totalDistanceM: number;
  totalDurationS: number;
  isMock: boolean;
}

interface DirectionsResponse {
  status: string;
  routes?: Array<{
    waypoint_order: number[];
    overview_polyline?: { points: string };
    legs?: Array<{ distance?: { value: number }; duration?: { value: number } }>;
  }>;
}

export async function optimizeRoute(
  origin: { lat: number; lng: number },
  stops: RouteStop[],
): Promise<OptimizedRoute> {
  const empty: OptimizedRoute = {
    orderedStopIds: stops.map((s) => s.id),
    polyline: [],
    totalDistanceM: 0,
    totalDurationS: 0,
    isMock: true,
  };

  if (stops.length === 0) return empty;

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return empty;

  // Última parada vira destination; outras são waypoints com optimize:true
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(0, -1);

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    key,
    mode: "driving",
    region: "br",
  });
  if (waypoints.length > 0) {
    params.set(
      "waypoints",
      "optimize:true|" + waypoints.map((w) => `${w.lat},${w.lng}`).join("|"),
    );
  }

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
    if (!res.ok) return empty;
    const j = (await res.json()) as DirectionsResponse;
    if (j.status !== "OK" || !j.routes?.[0]) return empty;

    const route = j.routes[0];
    const order = route.waypoint_order ?? [];
    const orderedIds: string[] = [
      ...order.map((i) => waypoints[i].id),
      destination.id,
    ];

    const polyline = route.overview_polyline?.points ? decodePolyline(route.overview_polyline.points) : [];
    const totalDistanceM = (route.legs ?? []).reduce((s, l) => s + (l.distance?.value ?? 0), 0);
    const totalDurationS = (route.legs ?? []).reduce((s, l) => s + (l.duration?.value ?? 0), 0);

    return {
      orderedStopIds: orderedIds,
      polyline,
      totalDistanceM,
      totalDurationS,
      isMock: false,
    };
  } catch {
    return empty;
  }
}

/**
 * Decodifica polyline encoded do Google em array de [lat, lng].
 * Algoritmo padrão Google Maps polyline encoding.
 */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const len = encoded.length;

  while (index < len) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}
