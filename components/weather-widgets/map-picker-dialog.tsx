"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { MapPin, Search, Crosshair, X, Navigation } from "lucide-react";

// Dynamically import the inner map to avoid SSR issues with Leaflet
const MapInner = dynamic(() => import("./map-picker-inner"), { ssr: false, loading: () => (
  <div className="flex-1 flex items-center justify-center bg-surface font-mono text-xs text-text-disabled animate-pulse">
    LOADING MAP TILES…
  </div>
)});

interface MapPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lon: number, displayName: string) => void;
}

export interface PickedLocation {
  lat: number;
  lon: number;
  displayName: string;
}

export function MapPickerDialog({ isOpen, onClose, onLocationSelect }: MapPickerDialogProps) {
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPicked(null);
      setSearchQuery("");
      setSearchError(null);
    }
  }, [isOpen]);

  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    setPicked({ lat, lon, displayName: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°` });
    // Reverse geocode via Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.display_name?.split(",")[0] ||
        "Unknown";
      setPicked({ lat, lon, displayName: city });
    } catch {
      // Keep coordinate fallback
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setSearchError("NO LOCATION FOUND. TRY A DIFFERENT QUERY.");
        return;
      }
      const { lat, lon, display_name } = data[0];
      const city = display_name.split(",")[0];
      setPicked({ lat: parseFloat(lat), lon: parseFloat(lon), displayName: city });
    } catch {
      setSearchError("GEOCODING FAILED. CHECK NETWORK.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleConfirm = () => {
    if (!picked) return;
    onLocationSelect(picked.lat, picked.lon, picked.displayName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl w-full bg-surface/98 border border-border-visible rounded-none overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col p-0 h-[85vh] md:h-[80vh]"
      >
        {/* Nothing OS Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-visible shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: "#00E5FF", boxShadow: "0 0 8px 1px rgba(0,229,255,0.5)" }}
            />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">
                GEO_PINPOINT_SELECTOR
              </span>
              <span className="font-mono text-[9px] text-text-disabled uppercase tracking-widest">
                STATION_MAP // TAP TO LOCK COORDINATES
              </span>
            </div>
          </div>
          <DialogClose asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-visible hover:border-text-primary hover:bg-surface-raised rounded-none transition-all duration-150 group font-mono text-[9px] text-text-secondary hover:text-text-primary font-bold">
              <span>CLOSE</span>
              <X size={10} className="transition-transform group-hover:rotate-90 duration-200" />
            </button>
          </DialogClose>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 px-4 py-3 border-b border-border-subtle shrink-0 bg-surface-raised/40">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="SEARCH CITY OR ADDRESS…"
              className="w-full bg-surface border border-border-visible rounded-none pl-8 pr-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 border border-border-visible hover:border-[#00E5FF] hover:text-[#00E5FF] bg-transparent rounded-none font-mono text-[10px] text-text-secondary transition-colors disabled:opacity-50"
          >
            {isSearching ? "…" : "SEARCH"}
          </button>
        </div>

        {searchError && (
          <p className="px-4 py-1.5 font-mono text-[9px] text-[#FF9100] bg-[#FF9100]/5 border-b border-border-subtle shrink-0">
            ⚠ {searchError}
          </p>
        )}

        {/* Map area */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          <MapInner
            pickedLocation={picked}
            onMapClick={handleMapClick}
          />

          {/* Dot-matrix overlay at edges */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Footer / confirm */}
        <div className="shrink-0 px-5 py-4 border-t border-border-visible flex items-center justify-between gap-4 bg-surface/80">
          {picked ? (
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={12} className="text-[#00E5FF] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-xs text-text-primary font-bold truncate">
                  {picked.displayName}
                </span>
                <span className="font-mono text-[9px] text-text-disabled">
                  {picked.lat.toFixed(5)}°N, {picked.lon.toFixed(5)}°E
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Crosshair size={12} className="text-text-disabled" />
              <span className="font-mono text-[10px] text-text-disabled uppercase">
                TAP ON MAP TO PIN A LOCATION
              </span>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!picked}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#00E5FF] bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-none font-mono text-xs text-[#00E5FF] font-bold transition-all duration-200 shrink-0"
          >
            <Navigation size={11} />
            LOAD WEATHER
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
