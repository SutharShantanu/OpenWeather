"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HeaderControls } from "@/components/weather-widgets/header-controls";
import { searchCoordinates } from "@/lib/weather";
import { Info } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q");

  useEffect(() => {
    if (q) {
      searchCoordinates(q).then((geo) => {
        if (geo) {
          router.replace(`/weather/${encodeURIComponent(geo.name.toLowerCase())}`);
        } else {
          // Stay on search page or redirect back to home if not found
        }
      });
    } else {
      router.replace("/");
    }
  }, [q, router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-none mt-12 max-w-3xl mx-auto w-full">
      <div className="w-10 h-10 border-2 border-border-visible border-t-accent rounded-full animate-spin mb-4" />
      <span className="font-mono text-xs text-text-disabled uppercase">
        SEARCHING INDEX FOR: {q || "..."}
      </span>
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col">
        <HeaderControls
          onSearch={(query) => router.push(`/search?q=${encodeURIComponent(query)}`)}
          onLocate={() => router.push("/weather/current")}
          onOpenMap={() => router.push("/weather/london")}
          isLoading={true}
          dataSource="LIVE_API"
          isEditingLayout={false}
          onToggleEditLayout={() => {}}
          onResetLayout={() => {}}
        />
        <React.Suspense fallback={<div className="font-mono text-xs text-text-disabled mt-12 text-center">LOADING SEARCH ENGINE...</div>}>
          <SearchContent />
        </React.Suspense>
      </div>
    </div>
  );
}
