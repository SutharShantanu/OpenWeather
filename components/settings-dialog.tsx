"use client";

import React, { useState } from "react";
import {
  Settings,
  MapPin,
  Globe,
  Volume2,
  Moon,
  Sun,
  Laptop,
  Check,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { WindSpeedUnit, PressureUnit, PrecipitationUnit } from "@/lib/weather";

export interface ExtendedSettings {
  tempUnit: "C" | "F";
  windUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  precipUnit: PrecipitationUnit;
  timeFormat: "12h" | "24h";
  language: string;
  speechRate: number;
  autoSpeakOnLoad: boolean;
}

export const DEFAULT_EXTENDED_SETTINGS: ExtendedSettings = {
  tempUnit: "C",
  windUnit: "m/s",
  pressureUnit: "hPa",
  precipUnit: "mm",
  timeFormat: "24h",
  language: "en",
  speechRate: 1.0,
  autoSpeakOnLoad: false,
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ExtendedSettings;
  onUpdateSettings: (newSettings: Partial<ExtendedSettings>) => void;
  onResetSettings: () => void;
  pinnedCities: string[];
  onAddPinnedCity: (city: string) => void;
  onRemovePinnedCity: (city: string) => void;
  onSelectCity: (city: string) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onResetSettings,
  pinnedCities,
  onAddPinnedCity,
  onRemovePinnedCity,
  onSelectCity,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [newCityInput, setNewCityInput] = useState("");

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCityInput.trim()) {
      onAddPinnedCity(newCityInput.trim());
      setNewCityInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 font-mono text-xs">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Settings className="size-3.5" />
            </div>
            <DialogTitle className="text-base font-heading font-semibold tracking-tight text-foreground">
              Station & Application Preferences
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Configure meteorological units, pinned telemetry stations, audio speech & regional conventions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="units" className="w-full pt-2">
          <TabsList className="w-full justify-start overflow-x-auto border-b border-border p-0 bg-transparent h-9 mb-4">
            <TabsTrigger
              value="units"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              Units
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              Favorites ({pinnedCities.length})
            </TabsTrigger>
            <TabsTrigger
              value="localization"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              Regional
            </TabsTrigger>
            <TabsTrigger
              value="speech"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              Speech & Audio
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3"
            >
              Theme
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: UNITS */}
          <TabsContent value="units" className="space-y-4 focus-visible:outline-none">
            {/* Temperature */}
            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold flex justify-between">
                <span>Temperature Standard</span>
                <span className="text-primary font-bold">°{settings.tempUnit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant={settings.tempUnit === "C" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateSettings({ tempUnit: "C" })}
                  className="font-mono text-xs"
                >
                  Celsius (°C)
                </Button>
                <Button
                  variant={settings.tempUnit === "F" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateSettings({ tempUnit: "F" })}
                  className="font-mono text-xs"
                >
                  Fahrenheit (°F)
                </Button>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold flex justify-between">
                <span>Wind Velocity Unit</span>
                <span className="text-primary font-bold">{settings.windUnit}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {(["m/s", "km/h", "mph", "knots"] as WindSpeedUnit[]).map((u) => (
                  <Button
                    key={u}
                    variant={settings.windUnit === u ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateSettings({ windUnit: u })}
                    className="font-mono text-xs"
                  >
                    {u}
                  </Button>
                ))}
              </div>
            </div>

            {/* Barometric Pressure */}
            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold flex justify-between">
                <span>Atmospheric Barometer</span>
                <span className="text-primary font-bold">{settings.pressureUnit}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["hPa", "inHg", "mmHg"] as PressureUnit[]).map((u) => (
                  <Button
                    key={u}
                    variant={settings.pressureUnit === u ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateSettings({ pressureUnit: u })}
                    className="font-mono text-xs"
                  >
                    {u}
                  </Button>
                ))}
              </div>
            </div>

            {/* Precipitation */}
            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold flex justify-between">
                <span>Precipitation Measurement</span>
                <span className="text-primary font-bold">{settings.precipUnit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(["mm", "in"] as PrecipitationUnit[]).map((u) => (
                  <Button
                    key={u}
                    variant={settings.precipUnit === u ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateSettings({ precipUnit: u })}
                    className="font-mono text-xs"
                  >
                    {u === "mm" ? "Millimeters (mm)" : "Inches (in)"}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: FAVORITES */}
          <TabsContent value="favorites" className="space-y-3 focus-visible:outline-none">
            <form onSubmit={handleAddCity} className="flex gap-2">
              <Input
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                placeholder="Add favorite city (e.g. Madrid, Sydney, Zurich)..."
                className="h-8 text-xs font-mono rounded-none"
              />
              <Button type="submit" size="sm" className="h-8 px-3 font-mono text-xs gap-1">
                <Plus className="size-3" />
                <span>Add</span>
              </Button>
            </form>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {pinnedCities.map((cityName) => (
                <div
                  key={cityName}
                  className="flex items-center justify-between p-2.5 bg-muted/20 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3 text-primary" />
                    <span className="font-bold text-foreground text-xs">{cityName}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        onSelectCity(cityName);
                        onOpenChange(false);
                      }}
                      className="h-6 px-2 text-tiny font-mono"
                    >
                      Load Station
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemovePinnedCity(cityName)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      title="Remove from favorites"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: REGIONAL */}
          <TabsContent value="localization" className="space-y-4 focus-visible:outline-none">
            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold">
                Language Display
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { code: "en", label: "English" },
                  { code: "es", label: "Español" },
                  { code: "fr", label: "Français" },
                  { code: "de", label: "Deutsch" },
                  { code: "ja", label: "日本語" },
                  { code: "hi", label: "हिन्दी" },
                ].map((lang) => (
                  <Button
                    key={lang.code}
                    variant={settings.language === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateSettings({ language: lang.code })}
                    className="font-mono text-xs"
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold">
                Time Representation
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant={settings.timeFormat === "24h" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateSettings({ timeFormat: "24h" })}
                  className="font-mono text-xs"
                >
                  24-Hour (14:30)
                </Button>
                <Button
                  variant={settings.timeFormat === "12h" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateSettings({ timeFormat: "12h" })}
                  className="font-mono text-xs"
                >
                  12-Hour (2:30 PM)
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: SPEECH */}
          <TabsContent value="speech" className="space-y-4 focus-visible:outline-none">
            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold flex justify-between">
                <span>Speech Velocity (TTS)</span>
                <span className="text-primary font-bold">{settings.speechRate}x</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[0.8, 1.0, 1.2, 1.4].map((rate) => (
                  <Button
                    key={rate}
                    variant={settings.speechRate === rate ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateSettings({ speechRate: rate })}
                    className="font-mono text-xs"
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted/20 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground text-xs block">Automatic Audio Briefing</span>
                <span className="text-tiny text-muted-foreground">
                  Read aloud weather report automatically when searching a new station
                </span>
              </div>
              <Button
                variant={settings.autoSpeakOnLoad ? "default" : "outline"}
                size="xs"
                onClick={() => onUpdateSettings({ autoSpeakOnLoad: !settings.autoSpeakOnLoad })}
                className="h-7 font-mono text-xs"
              >
                {settings.autoSpeakOnLoad ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 5: APPEARANCE */}
          <TabsContent value="appearance" className="space-y-4 focus-visible:outline-none">
            <div className="space-y-1.5 p-3 bg-muted/20 border border-border">
              <div className="text-tiny uppercase text-muted-foreground font-bold">
                Theme Mode
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="font-mono text-xs gap-1.5"
                >
                  <Moon className="size-3.5" />
                  <span>Dark</span>
                </Button>
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="font-mono text-xs gap-1.5"
                >
                  <Sun className="size-3.5" />
                  <span>Light</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="font-mono text-xs gap-1.5"
                >
                  <Laptop className="size-3.5" />
                  <span>System</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-border pt-3 flex items-center justify-between sm:justify-between w-full">
          <Button
            variant="ghost"
            size="xs"
            onClick={onResetSettings}
            className="font-mono text-tiny text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-2.5 mr-1" />
            Reset All
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs px-4"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
