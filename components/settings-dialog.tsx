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
  Radio,
  Server,
  Cpu,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
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
import {
  WindSpeedUnit,
  PressureUnit,
  PrecipitationUnit,
  WeatherDataSource,
  ForecastStationModel,
  FORECAST_STATION_MODELS,
  WEATHER_DATA_PROVIDERS,
} from "@/lib/weather";

export interface ExtendedSettings {
  tempUnit: "C" | "F";
  windUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  precipUnit: PrecipitationUnit;
  timeFormat: "12h" | "24h";
  language: string;
  speechRate: number;
  autoSpeakOnLoad: boolean;
  weatherSource: WeatherDataSource;
  forecastStation: ForecastStationModel;
  customApiKey?: string;
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
  weatherSource: "open-meteo",
  forecastStation: "best_match",
  customApiKey: "",
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
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
  activeTab = "source",
  onActiveTabChange,
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
  const [showKey, setShowKey] = useState(false);
  const [testPingStatus, setTestPingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testPingMsg, setTestPingMsg] = useState("");

  const handleTestApiKey = async () => {
    setTestPingStatus("loading");
    setTestPingMsg("Connecting to OpenWeather station...");
    try {
      const keyToTest = settings.customApiKey?.trim() || "";
      const url = keyToTest
        ? `/api/weather?city=London&source=openweathermap&apiKey=${encodeURIComponent(keyToTest)}`
        : `/api/weather?city=London&source=openweathermap`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.providerName?.includes("Failover") || json.stationName?.includes("Failover")) {
          setTestPingStatus("error");
          setTestPingMsg("Authentication failed. Please check the OpenWeather API key.");
        } else {
          setTestPingStatus("success");
          setTestPingMsg(`Handshake Verified! Live telemetry: ${json.current?.cityName || "London"} (${json.current?.temp}°C, ${json.current?.humidity}% humidity).`);
        }
      } else {
        setTestPingStatus("error");
        setTestPingMsg(`API responded with HTTP ${res.status}.`);
      }
    } catch {
      setTestPingStatus("error");
      setTestPingMsg("Network or gateway timeout testing station.");
    }
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCityInput.trim()) {
      onAddPinnedCity(newCityInput.trim());
      setNewCityInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full font-mono text-xs max-h-[90vh] overflow-y-auto">
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
            Configure meteorological data source, numerical forecast station, units, pinned telemetry & speech
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
          <TabsList className="w-full justify-start border-b border-border p-0 bg-transparent mb-4 overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="source"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3 whitespace-nowrap"
            >
              Source & Station
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3 whitespace-nowrap"
            >
              Units
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3 whitespace-nowrap"
            >
              Favorites ({pinnedCities.length})
            </TabsTrigger>
            <TabsTrigger
              value="localization"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3 whitespace-nowrap"
            >
              Regional
            </TabsTrigger>
            <TabsTrigger
              value="speech"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3 whitespace-nowrap"
            >
              Speech & Audio
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="font-mono text-xs gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none px-3 whitespace-nowrap"
            >
              Theme
            </TabsTrigger>
          </TabsList>

          {/* TAB: SOURCE & STATION */}
          <TabsContent value="source" className="space-y-4 focus-visible:outline-none">
            {/* Telemetry Status Bar */}
            <div className="p-3 bg-muted/20 border border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-foreground font-bold uppercase tracking-wider text-xs">
                  Active Telemetry Feed
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                <Badge variant="outline" className="text-primary border-primary/40 bg-primary/5 uppercase">
                  {settings.weatherSource}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Model:{" "}
                  <strong className="text-foreground">
                    {FORECAST_STATION_MODELS.find((m) => m.id === settings.forecastStation)?.name || settings.forecastStation}
                  </strong>
                </span>
              </div>
            </div>

            {/* SECTION 1: DATA PROVIDER / SOURCE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-tiny uppercase text-muted-foreground font-bold flex items-center gap-1.5">
                    <Server className="size-3 text-primary" />
                    <span>1. Meteorological Data Provider (Source)</span>
                  </div>
                  <p className="text-tiny text-muted-foreground mt-0.5">
                    Select the observation and primary synoptic data provider
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WEATHER_DATA_PROVIDERS.map((provider) => {
                  const isSelected = (settings.weatherSource || "open-meteo") === provider.id;
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => onUpdateSettings({ weatherSource: provider.id })}
                      className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                          : "border-border bg-muted/20 hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-foreground text-xs">{provider.name}</div>
                          {isSelected ? (
                            <div className="size-4 bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                              <Check className="size-3" />
                            </div>
                          ) : (
                            <div className="size-4 border border-border shrink-0" />
                          )}
                        </div>
                        <div className="text-tiny text-muted-foreground mt-1 line-clamp-2">
                          {provider.description}
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-tiny">
                        <span className="text-muted-foreground truncate mr-2">{provider.provider}</span>
                        {provider.requiresApiKey ? (
                          <span className="text-amber-500 font-bold shrink-0">API Key</span>
                        ) : (
                          <span className="text-emerald-500 font-bold shrink-0">Keyless</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* OpenWeatherMap API Key Config */}
              {(settings.weatherSource === "openweathermap" || settings.customApiKey) && (
                <div className="p-3 bg-muted/20 border border-border space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Key className="size-3.5 text-primary" />
                      <span>OpenWeatherMap API Key</span>
                    </div>
                    <span className="text-tiny text-muted-foreground">Optional Custom Override</span>
                  </div>
                  <p className="text-tiny text-muted-foreground">
                    Leave blank to use the server environment key, or enter your personal OpenWeather key.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKey ? "text" : "password"}
                        value={settings.customApiKey || ""}
                        onChange={(e) => onUpdateSettings({ customApiKey: e.target.value })}
                        placeholder="e.g. 4483c686af6e2e21072d875ed1e5be27"
                        className="h-8 text-xs font-mono pr-8 rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        title={showKey ? "Hide key" : "Show key"}
                      >
                        {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestApiKey}
                      disabled={testPingStatus === "loading"}
                      className="h-8 px-3 font-mono text-xs gap-1.5 shrink-0"
                    >
                      <RefreshCw className={`size-3 ${testPingStatus === "loading" ? "animate-spin text-primary" : ""}`} />
                      <span>Test Handshake</span>
                    </Button>
                  </div>

                  {testPingMsg && (
                    <div
                      className={`p-2 text-tiny font-mono border ${
                        testPingStatus === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}
                    >
                      {testPingMsg}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 2: FORECAST STATION & NWP MODEL */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-tiny uppercase text-muted-foreground font-bold flex items-center gap-1.5">
                    <Cpu className="size-3 text-primary" />
                    <span>2. Numerical Weather Prediction (NWP) Forecast Station</span>
                  </div>
                  <p className="text-tiny text-muted-foreground mt-0.5">
                    Choose the atmospheric physics simulation station model for forecasting
                  </p>
                </div>
              </div>

              {settings.weatherSource === "openweathermap" && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-tiny font-mono">
                  Notice: OpenWeatherMap uses OWM Station Consensus. Model selection below applies when Open-Meteo or Auto Failover is active.
                </div>
              )}

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {FORECAST_STATION_MODELS.map((model) => {
                  const isSelected = (settings.forecastStation || "best_match") === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => onUpdateSettings({ forecastStation: model.id })}
                      className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                          : "border-border bg-muted/20 hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs">{model.name}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                            {model.resolution}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">• {model.coverage}</span>
                        </div>
                        <p className="text-tiny text-muted-foreground truncate">{model.description}</p>
                        <div className="text-[10px] text-muted-foreground/80 font-mono pt-0.5">
                          Agency: {model.agency}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="size-4 bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="size-3" />
                          </div>
                        ) : (
                          <div className="size-4 border border-border" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

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
