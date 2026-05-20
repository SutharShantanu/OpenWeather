import React, { useState, useEffect } from "react";
import { Search, MapPin, Settings, Check, RotateCcw, Sun, Moon, Monitor, Map } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDebounce } from "@/hooks/use-debounce";

interface HeaderControlsProps {
  onSearch: (query: string) => void;
  onLocate: () => void;
  onOpenMap: () => void;
  isLoading: boolean;
  dataSource: "LIVE_API" | "MOCK_FALLBACK";
  isEditingLayout: boolean;
  onToggleEditLayout: () => void;
  onResetLayout: () => void;
  activeCityName?: string;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  onSearch,
  onLocate,
  onOpenMap,
  isLoading,
  dataSource,
  isEditingLayout,
  onToggleEditLayout,
  onResetLayout,
  activeCityName,
}) => {
  const [query, setQuery] = useState("");
  const [lastSearched, setLastSearched] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const debouncedQuery = useDebounce(query, 600);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state with active city name from parent
  useEffect(() => {
    if (activeCityName) {
      setQuery(activeCityName.toUpperCase());
      setLastSearched(activeCityName.toLowerCase());
    }
  }, [activeCityName]);

  // Run search when debounced value updates and is different from last searched
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed && trimmed.toLowerCase() !== lastSearched) {
      onSearch(trimmed);
      setLastSearched(trimmed.toLowerCase());
    }
  }, [debouncedQuery, onSearch, lastSearched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && trimmed.toLowerCase() !== lastSearched) {
      onSearch(trimmed);
      setLastSearched(trimmed.toLowerCase());
    }
  };

  return (
    <header className="w-full flex flex-col xl:flex-row gap-6 items-center justify-between border-b border-border-subtle pb-6 mb-8 relative z-30">
      {/* Brand Label & Status Indicator */}
      <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
        <div className="flex flex-col">
          <span className="font-mono text-xs tracking-[0.2em] font-extrabold text-text-primary">
            NOTHING // WEATHER_OS
          </span>
          <span className="font-mono text-xs tracking-wider text-text-disabled mt-0.5">
            DEVICE_MATRIX_SHELL // VER_2.8.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Pulse LED Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-surface/50 backdrop-blur-md border border-border-subtle rounded-none shadow-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dataSource === "LIVE_API" ? "bg-accent active-led" : "bg-warning animate-pulse"
              }`}
            />
            <span className="font-mono text-xs tracking-widest text-text-primary uppercase font-bold">
              {dataSource === "LIVE_API" ? "LIVE_FEED" : "OFFLINE_MOCK"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Segment: Theme Toggle, Search & Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
        {/* Theme Switcher ToggleGroup from shadcn */}
        <div className="flex items-center bg-surface/30 border border-border rounded-none h-10 px-1 overflow-hidden">
          <ToggleGroup
            type="single"
            value={mounted ? theme : "system"}
            onValueChange={(val) => {
              if (val) setTheme(val);
            }}
            variant="outline"
            size="sm"
            className="border-none gap-0"
          >
            <ToggleGroupItem
              value="light"
              aria-label="Toggle Light Theme"
              className="rounded-none h-8 px-2.5 font-mono text-xs font-bold tracking-wider hover:bg-surface/50 data-[state=on]:bg-foreground data-[state=on]:text-background transition-all"
            >
              <Sun className="size-3 mr-1" strokeWidth={2} />
              LIGHT
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              aria-label="Toggle Dark Theme"
              className="rounded-none h-8 px-2.5 font-mono text-xs font-bold tracking-wider hover:bg-surface/50 data-[state=on]:bg-foreground data-[state=on]:text-background transition-all"
            >
              <Moon className="size-3 mr-1" strokeWidth={2} />
              DARK
            </ToggleGroupItem>
            <ToggleGroupItem
              value="system"
              aria-label="Toggle System Theme"
              className="rounded-none h-8 px-2.5 font-mono text-xs font-bold tracking-wider hover:bg-surface/50 data-[state=on]:bg-foreground data-[state=on]:text-background transition-all"
            >
              <Monitor className="size-3 mr-1" strokeWidth={2} />
              AUTO
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Input group search input from shadcn */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 md:flex-initial md:w-56"
        >
          <InputGroup className="h-10 border border-border-visible bg-surface/40 rounded-none">
            <InputGroupAddon align="inline-start" className="pl-3.5 pr-1.5">
              <Search className="text-text-secondary" size={14} strokeWidth={1.5} />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="SEARCH REGION..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="h-full text-xs font-mono uppercase px-1 text-text-primary"
            />
            {isLoading && (
              <InputGroupAddon align="inline-end" className="pr-3.5">
                <Spinner className="size-3.5 text-text-secondary" />
              </InputGroupAddon>
            )}
          </InputGroup>
        </form>

        {/* Locate Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onLocate}
          disabled={isLoading}
          title="SYNC GPS LOCATION"
          className="rounded-none h-10 w-10 border-border"
        >
          {isLoading ? (
            <Spinner className="size-4 text-text-secondary" />
          ) : (
            <MapPin size={16} strokeWidth={1.5} />
          )}
        </Button>

        {/* Map Pinpoint Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenMap}
          disabled={isLoading}
          title="PINPOINT LOCATION ON MAP"
          className="rounded-none h-10 w-10 border-border hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors"
        >
          <Map size={16} strokeWidth={1.5} />
        </Button>
        <Button
          variant={isEditingLayout ? "destructive" : "outline"}
          onClick={onToggleEditLayout}
          title={isEditingLayout ? "SAVE NEW GRID LAYOUT" : "RECONFIGURE BENGRID LAYOUT"}
          className="rounded-none h-10 border-border text-xs font-mono uppercase font-bold px-4"
        >
          {isEditingLayout ? (
            <>
              <Check className="size-3.5 mr-1.5" strokeWidth={2} />
              SAVE LAYOUT
            </>
          ) : (
            <>
              <Settings className="size-3.5 mr-1.5" strokeWidth={1.5} />
              EDIT LAYOUT
            </>
          )}
        </Button>

        {/* Reset Layout Option */}
        {isEditingLayout && (
          <Button
            variant="outline"
            onClick={onResetLayout}
            title="RESTORE DEFAULT BENTO GRID"
            className="rounded-none h-10 border-border text-xs font-mono uppercase font-bold px-3 hover:bg-white/5"
          >
            <RotateCcw className="size-3.5 mr-1.5" strokeWidth={1.5} />
            RESET
          </Button>
        )}
      </div>
    </header>
  );
};
