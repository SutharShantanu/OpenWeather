"use client";

import React, { useEffect, useRef } from "react";
import type { PickedLocation } from "./map-picker-dialog";

// Leaflet CSS injected once via useEffect
interface MapInnerProps {
  pickedLocation: PickedLocation | null;
  onMapClick: (lat: number, lon: number) => void;
}

export default function MapInner({ pickedLocation, onMapClick }: MapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark CartoDB tiles — matches Nothing OS dark aesthetic
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 19 }
      ).addTo(map);

      // Minimal attribution
      L.control.attribution({ prefix: false, position: "bottomright" }).addTo(map);
      map.attributionControl?.setPrefix(
        '<span style="font-family:monospace;font-size:9px;opacity:0.4">© CARTO © OSM</span>'
      );

      // Zoom buttons (custom)
      L.control.zoom({ position: "topright" }).addTo(map);

      // Click handler
      map.on("click", (e: any) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });

      // Custom cyan pin icon
      const pinIcon = L.divIcon({
        html: `<div style="
          width:18px;height:18px;
          background:#00E5FF;
          border:2px solid #fff;
          box-shadow:0 0 12px 3px rgba(0,229,255,0.7);
          clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%);
        "></div>`,
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 18],
      });

      mapRef.current = { map, L, pinIcon };
    };

    init();

    return () => {
      mapRef.current?.map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update click handler when callback changes
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    m.map.off("click");
    m.map.on("click", (e: any) => onMapClick(e.latlng.lat, e.latlng.lng));
  }, [onMapClick]);

  // Sync marker with picked location
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    const { map, L, pinIcon } = m;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (pickedLocation) {
      const marker = L.marker([pickedLocation.lat, pickedLocation.lon], { icon: pinIcon }).addTo(map);
      markerRef.current = marker;
      map.flyTo([pickedLocation.lat, pickedLocation.lon], Math.max(map.getZoom(), 10), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [pickedLocation]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
