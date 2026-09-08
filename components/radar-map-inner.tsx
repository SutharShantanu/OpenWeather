"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RadarMapInnerProps {
  lat: number;
  lon: number;
  cityName: string;
  activeLayer: "radar" | "satellite" | "none";
  currentFrame: { time: number; path: string } | null;
  mapStyle?: "dark" | "voyager" | "osm";
  opacity?: number;
}

export function RadarMapInner({
  lat,
  lon,
  cityName,
  activeLayer,
  currentFrame,
  mapStyle = "dark",
  opacity = 0.75,
}: RadarMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const overlayRef = useRef<L.TileLayer | null>(null);

  const getBaseTileUrl = (style: string) => {
    switch (style) {
      case "voyager":
        return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      case "osm":
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      case "dark":
      default:
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 8,
      zoomControl: true,
      attributionControl: false,
    });

    const baseTile = L.tileLayer(getBaseTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    baseTileRef.current = baseTile;

    const marker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "custom-pin",
        html: `<div style="width: 12px; height: 12px; background: var(--primary); border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    }).addTo(map);

    marker.bindPopup(`<b>${cityName} Station</b><br/>${lat.toFixed(3)}°, ${lon.toFixed(3)}°`);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update base map style if switched
  useEffect(() => {
    if (!mapRef.current) return;
    if (baseTileRef.current) {
      mapRef.current.removeLayer(baseTileRef.current);
    }
    const newBase = L.tileLayer(getBaseTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(mapRef.current);
    baseTileRef.current = newBase;
    if (overlayRef.current) {
      overlayRef.current.bringToFront();
    }
  }, [mapStyle]);

  // Update center when coordinates change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lon], 8);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      markerRef.current.setPopupContent(`<b>${cityName} Station</b><br/>${lat.toFixed(3)}°, ${lon.toFixed(3)}°`);
    }
  }, [lat, lon, cityName]);

  // Update Doppler radar or satellite overlay
  useEffect(() => {
    if (!mapRef.current) return;

    if (overlayRef.current) {
      mapRef.current.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    if (activeLayer === "none" || !currentFrame) return;

    let tileUrl = "";
    if (activeLayer === "radar") {
      // 2 = Universal Blue-Green-Yellow-Red palette
      tileUrl = `https://tilecache.rainviewer.com${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
    } else if (activeLayer === "satellite") {
      // 0 = infrared
      tileUrl = `https://tilecache.rainviewer.com${currentFrame.path}/256/{z}/{x}/{y}/0/0_0.png`;
    }

    const overlay = L.tileLayer(tileUrl, {
      opacity: opacity,
      zIndex: 10,
    });

    overlay.addTo(mapRef.current);
    overlayRef.current = overlay;
  }, [activeLayer, currentFrame, opacity]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative isolate overflow-hidden z-0"
    />
  );
}
