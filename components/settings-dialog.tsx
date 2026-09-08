"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
  Square,
  Sliders,
  Headphones,
  Thermometer,
  Wind,
  Gauge,
  CloudRain,
  CloudLightning,
  ShieldCheck,
  Clock,
  Layers,
  Activity,
  Info,
  SunMoon,
  Sparkle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";
import { IconStack } from "@/components/reui/icon-stack";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  WindSpeedUnit,
  PressureUnit,
  PrecipitationUnit,
  WeatherDataSource,
  ForecastStationModel,
  FORECAST_STATION_MODELS,
  WEATHER_DATA_PROVIDERS,
} from "@/lib/weather";
import {
  GoogleTtsModel,
  GoogleTtsAudioProfile,
  GOOGLE_TTS_MODELS,
  GOOGLE_TTS_AUDIO_PROFILES,
  GOOGLE_TTS_PITCH_PRESETS,
  GOOGLE_TTS_VOLUME_PRESETS,
  getAvailableGoogleVoices,
} from "@/lib/google-tts";
import { WeatherSpeechSynthesizer } from "@/lib/speech";

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
  // Google Text-to-Speech configurations
  googleTtsModel: GoogleTtsModel;
  googleTtsVoice: string;
  googleTtsPitch: number;
  googleTtsAudioProfile: GoogleTtsAudioProfile;
  googleTtsVolumeGain: number;
  googleApiKey?: string;
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
  // Google TTS defaults
  googleTtsModel: "Journey",
  googleTtsVoice: "en-US-Journey-F",
  googleTtsPitch: 0.0,
  googleTtsAudioProfile: "headphone-class-device",
  googleTtsVolumeGain: 0.0,
  googleApiKey: "",
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

const POPULAR_CITIES = [
  "London",
  "Tokyo",
  "New York",
  "Paris",
  "Zurich",
  "Sydney",
  "Singapore",
  "Reykjavik",
];

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
  const [mounted, setMounted] = useState(false);
  const [newCityInput, setNewCityInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [testPingStatus, setTestPingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testPingMsg, setTestPingMsg] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTogglePreviewVoice = async () => {
    if (isPlayingPreview) {
      WeatherSpeechSynthesizer.stop();
      setIsPlayingPreview(false);
      return;
    }

    const sampleText =
      settings.language === "hi"
        ? "नमस्ते। यह आपके गूगल मौसम प्रसारण और तापमान की आवाज का लाइव पूर्वावलोकन है।"
        : settings.language === "es"
        ? "Hola. Esta es una muestra en vivo de la voz meteorológica de Google Text-to-Speech para su estación."
        : settings.language === "fr"
        ? "Bonjour. Ceci est un aperçu en direct de la synthèse vocale Google pour votre station météo."
        : settings.language === "de"
        ? "Guten Tag. Dies ist eine Live-Vorschau der Google-Sprachsynthese für Ihren Wetterbericht."
        : settings.language === "ja"
        ? "こんにちは。こちらは Google Text-to-Speech による気象情報の音声プレビューです。"
        : "Good day. This is a live preview of your Google Text-to-Speech synoptic meteorological voice configuration.";

    setIsPlayingPreview(true);
    await WeatherSpeechSynthesizer.speak(sampleText, {
      rate: settings.speechRate,
      pitch: settings.googleTtsPitch,
      lang: settings.language,
      voiceName: settings.googleTtsVoice,
      model: settings.googleTtsModel,
      audioProfile: settings.googleTtsAudioProfile,
      volumeGainDb: settings.googleTtsVolumeGain,
      googleApiKey: settings.googleApiKey,
      onStart: () => setIsPlayingPreview(true),
      onEnd: () => setIsPlayingPreview(false),
      onError: () => setIsPlayingPreview(false),
    });
  };

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
          setTestPingMsg("Authentication failed. Please verify your OpenWeather API key.");
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

  const applyMetricPreset = () => {
    onUpdateSettings({
      tempUnit: "C",
      windUnit: "m/s",
      pressureUnit: "hPa",
      precipUnit: "mm",
    });
  };

  const applyImperialPreset = () => {
    onUpdateSettings({
      tempUnit: "F",
      windUnit: "mph",
      pressureUnit: "inHg",
      precipUnit: "in",
    });
  };

  const getProviderIcon = (id: WeatherDataSource) => {
    switch (id) {
      case "open-meteo":
        return <CloudLightning className="size-4 text-sky-500" />;
      case "openweathermap":
        return <Globe className="size-4 text-amber-500" />;
      case "simulation":
        return <Cpu className="size-4 text-purple-500" />;
      case "auto":
        return <ShieldCheck className="size-4 text-emerald-500" />;
      default:
        return <Server className="size-4 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full text-xs h-[90vh] max-h-[90vh] sm:h-[86vh] sm:max-h-[86vh] flex flex-col overflow-hidden p-0 gap-0 border border-border shadow-2xl bg-card">
        {/* DIALOG HEADER */}
        <DialogHeader className="p-4 sm:p-5 pr-14 pb-3.5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
              <Settings className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-heading font-semibold tracking-tight text-foreground">
                  Station & Application Preferences
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-border bg-background text-muted-foreground px-1.5 py-0 h-4">
                  v2.4
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure meteorological data feeds, numerical forecast models, measurement standards & voice telemetry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* TAB NAVIGATION */}
        <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full flex-1 flex flex-col min-h-0 overflow-hidden gap-0">
          <TabsList className="w-full justify-start border-b border-border p-1 px-3 bg-muted/30 shrink-0 overflow-x-auto flex-nowrap rounded-none h-11 gap-1">
            <TabsTrigger
              value="source"
              className="text-xs gap-1.5 h-8 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all whitespace-nowrap"
            >
              <Radio className="size-3.5 text-primary" />
              <span>Source & Station</span>
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="text-xs gap-1.5 h-8 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all whitespace-nowrap"
            >
              <Sliders className="size-3.5 text-primary" />
              <span>Units</span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="text-xs gap-1.5 h-8 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all whitespace-nowrap"
            >
              <MapPin className="size-3.5 text-primary" />
              <span>Favorites</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 rounded-full font-mono">
                {pinnedCities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="localization"
              className="text-xs gap-1.5 h-8 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all whitespace-nowrap"
            >
              <Globe className="size-3.5 text-primary" />
              <span>Regional</span>
            </TabsTrigger>
            <TabsTrigger
              value="speech"
              className="text-xs gap-1.5 h-8 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all whitespace-nowrap"
            >
              <Volume2 className="size-3.5 text-primary" />
              <span>Speech & Audio</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="text-xs gap-1.5 h-8 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all whitespace-nowrap"
            >
              <SunMoon className="size-3.5 text-primary" />
              <span>Theme</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SOURCE & STATION */}
          <TabsContent value="source" className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 focus-visible:outline-none">
            {/* REUI ALERT: Active Telemetry Feed */}
            <Alert variant="default" className="bg-card border-border shadow-xs flex flex-wrap items-center justify-between p-3.5 gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-xs tracking-tight text-foreground uppercase">
                      Active Telemetry Feed
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0 h-4">
                      LIVE
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Real-time atmospheric modeling & observation synchronizer
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <Badge variant="secondary" className="font-semibold uppercase tracking-wider px-2 py-0.5 border border-border">
                  {settings.weatherSource}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-xs font-sans">
                  Model:{" "}
                  <strong className="text-foreground font-mono">
                    {FORECAST_STATION_MODELS.find((m) => m.id === settings.forecastStation)?.name || settings.forecastStation}
                  </strong>
                </span>
              </div>
            </Alert>

            {/* SECTION 1: METEOROLOGICAL DATA PROVIDER */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Server className="size-3.5 text-primary" />
                    <span>1. Meteorological Data Provider (Source)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select the observation and primary synoptic data provider
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WEATHER_DATA_PROVIDERS.map((provider) => {
                  const isSelected = (settings.weatherSource || "open-meteo") === provider.id;
                  return (
                    <Card
                      key={provider.id}
                      onClick={() => onUpdateSettings({ weatherSource: provider.id })}
                      className={cn(
                        "p-3.5 text-left border transition-all cursor-pointer flex flex-col justify-between group",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-muted/60 border border-border/80 group-hover:border-primary/30 transition-colors">
                              {getProviderIcon(provider.id)}
                            </div>
                            <div className="font-heading font-semibold text-xs text-foreground">
                              {provider.name}
                            </div>
                          </div>
                          {isSelected ? (
                            <div className="size-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="size-3 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="size-4.5 rounded-full border border-border group-hover:border-primary/40 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {provider.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground truncate mr-2 font-mono">{provider.provider}</span>
                        {provider.requiresApiKey ? (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] font-mono shrink-0">
                            API Key
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px] font-mono shrink-0">
                            Keyless
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* OpenWeatherMap API Key Config */}
              {(settings.weatherSource === "openweathermap" || settings.customApiKey) && (
                <Card className="p-3.5 bg-muted/20 border border-border space-y-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Key className="size-3.5 text-primary" />
                      <span>OpenWeatherMap API Key</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                      Optional Custom Override
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Leave blank to use the shared server environment key, or provide your personal OpenWeather key for dedicated quota.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKey ? "text" : "password"}
                        value={settings.customApiKey || ""}
                        onChange={(e) => onUpdateSettings({ customApiKey: e.target.value })}
                        placeholder="e.g. 4483c686af6e2e21072d875ed1e5be27"
                        className="h-8 text-xs font-mono pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      className="h-8 px-3 text-xs gap-1.5 shrink-0"
                    >
                      <RefreshCw className={cn("size-3", testPingStatus === "loading" && "animate-spin text-primary")} />
                      <span>Test Handshake</span>
                    </Button>
                  </div>

                  {testPingMsg && (
                    <Alert
                      variant={testPingStatus === "success" ? "success" : "destructive"}
                      className="text-xs py-2 mt-1"
                    >
                      <AlertTitle className="text-xs font-semibold">
                        {testPingStatus === "success" ? "Handshake Verified" : "Authentication Failure"}
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-0.5">
                        {testPingMsg}
                      </AlertDescription>
                    </Alert>
                  )}
                </Card>
              )}
            </div>

            {/* SECTION 2: FORECAST STATION & NWP MODEL */}
            <div className="space-y-2.5 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Cpu className="size-3.5 text-primary" />
                    <span>2. Numerical Weather Prediction (NWP) Forecast Station</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose the atmospheric physics simulation station model for forecasting
                  </p>
                </div>
              </div>

              {settings.weatherSource === "openweathermap" && (
                <Alert variant="warning" className="text-xs py-2">
                  <AlertTitle className="text-xs font-semibold">Station Model Notice</AlertTitle>
                  <AlertDescription className="text-xs mt-0.5">
                    OpenWeatherMap uses OWM Station Consensus. Model selection below applies when Open-Meteo or Auto Failover is active.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                {FORECAST_STATION_MODELS.map((model) => {
                  const isSelected = (settings.forecastStation || "best_match") === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => onUpdateSettings({ forecastStation: model.id })}
                      className={cn(
                        "p-3 border transition-all cursor-pointer flex items-center justify-between gap-3 group rounded-md",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-semibold text-xs text-foreground">{model.name}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono bg-muted/30">
                            {model.resolution}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">• {model.coverage}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate leading-snug">{model.description}</p>
                        <div className="text-[10px] text-muted-foreground/80 font-mono">
                          Agency: <span className="text-foreground/90">{model.agency}</span>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="size-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xs">
                            <Check className="size-3 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="size-4.5 rounded-full border border-border group-hover:border-primary/40" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: UNITS */}
          <TabsContent value="units" className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 focus-visible:outline-none">
            {/* Quick Standard Presets Bar */}
            <Card className="p-3.5 bg-muted/20 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-primary/10 text-primary border border-primary/20">
                  <Sliders className="size-4" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-xs text-foreground">
                    Measurement System Presets
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Switch all parameters to International Metric or Imperial standards with one click
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyMetricPreset}
                  className="text-xs font-mono gap-1.5 h-8"
                >
                  <span>Metric (°C, m/s)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyImperialPreset}
                  className="text-xs font-mono gap-1.5 h-8"
                >
                  <span>Imperial (°F, mph)</span>
                </Button>
              </div>
            </Card>

            {/* 1. Temperature Standard */}
            <Card className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="size-4 text-rose-500" />
                  <span className="font-heading font-semibold text-xs text-foreground">Temperature Standard</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  °{settings.tempUnit}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Base thermodynamic scale for air temperature, dew point & apparent feels-like calculations
              </p>
              <ToggleGroup
                type="single"
                value={settings.tempUnit}
                onValueChange={(val) => {
                  if (val) onUpdateSettings({ tempUnit: val as "C" | "F" });
                }}
                className="grid grid-cols-2 gap-2 pt-1 w-full"
              >
                <ToggleGroupItem value="C" className="w-full justify-center text-xs py-2 h-auto">
                  <span className="font-semibold">Celsius (°C)</span>
                  <span className="text-[10px] text-muted-foreground ml-1 font-mono">0°C = 32°F</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="F" className="w-full justify-center text-xs py-2 h-auto">
                  <span className="font-semibold">Fahrenheit (°F)</span>
                  <span className="text-[10px] text-muted-foreground ml-1 font-mono">68°F = 20°C</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </Card>

            {/* 2. Wind Velocity Unit */}
            <Card className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="size-4 text-sky-500" />
                  <span className="font-heading font-semibold text-xs text-foreground">Wind Velocity Unit</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  {settings.windUnit}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Anemometer velocity scale for sustained winds and gust turbulence
              </p>
              <ToggleGroup
                type="single"
                value={settings.windUnit}
                onValueChange={(val) => {
                  if (val) onUpdateSettings({ windUnit: val as WindSpeedUnit });
                }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 w-full"
              >
                {(["m/s", "km/h", "mph", "knots"] as WindSpeedUnit[]).map((u) => (
                  <ToggleGroupItem key={u} value={u} className="w-full justify-center text-xs py-1.5 h-auto font-mono">
                    {u}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Card>

            {/* 3. Barometric Pressure */}
            <Card className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="size-4 text-amber-500" />
                  <span className="font-heading font-semibold text-xs text-foreground">Atmospheric Barometer</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  {settings.pressureUnit}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Mean sea-level atmospheric pressure measurement convention
              </p>
              <ToggleGroup
                type="single"
                value={settings.pressureUnit}
                onValueChange={(val) => {
                  if (val) onUpdateSettings({ pressureUnit: val as PressureUnit });
                }}
                className="grid grid-cols-3 gap-2 pt-1 w-full"
              >
                {(["hPa", "inHg", "mmHg"] as PressureUnit[]).map((u) => (
                  <ToggleGroupItem key={u} value={u} className="w-full justify-center text-xs py-1.5 h-auto font-mono">
                    {u}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Card>

            {/* 4. Precipitation Measurement */}
            <Card className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="size-4 text-blue-500" />
                  <span className="font-heading font-semibold text-xs text-foreground">Precipitation Accumulation</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  {settings.precipUnit}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Liquid precipitation and liquid-equivalent snowfall liquid accumulation
              </p>
              <ToggleGroup
                type="single"
                value={settings.precipUnit}
                onValueChange={(val) => {
                  if (val) onUpdateSettings({ precipUnit: val as PrecipitationUnit });
                }}
                className="grid grid-cols-2 gap-2 pt-1 w-full"
              >
                {(["mm", "in"] as PrecipitationUnit[]).map((u) => (
                  <ToggleGroupItem key={u} value={u} className="w-full justify-center text-xs py-1.5 h-auto font-mono">
                    {u === "mm" ? "Millimeters (mm)" : "Inches (in)"}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Card>
          </TabsContent>

          {/* TAB 3: FAVORITES */}
          <TabsContent value="favorites" className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 focus-visible:outline-none">
            <Card className="p-4 border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <span className="font-heading font-semibold text-xs text-foreground">Pinned Weather Stations</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {pinnedCities.length} Pinned
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Quick-access telemetry stations saved for rapid switching from the top telemetry header.
              </p>

              <form onSubmit={handleAddCity} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={newCityInput}
                    onChange={(e) => setNewCityInput(e.target.value)}
                    placeholder="Enter city or airport name (e.g. Madrid, Sydney, Zurich)..."
                    className="h-8 text-xs pl-8 font-sans"
                  />
                </div>
                <Button type="submit" size="sm" className="h-8 px-3 text-xs gap-1.5 shrink-0">
                  <Plus className="size-3.5" />
                  <span>Pin Station</span>
                </Button>
              </form>

              {/* Quick suggestions */}
              <div className="pt-1">
                <div className="text-[11px] text-muted-foreground mb-1.5 font-medium">
                  Popular Meteorological Stations:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CITIES.filter((c) => !pinnedCities.includes(c)).slice(0, 6).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => onAddPinnedCity(city)}
                      className="px-2 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-[11px] text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="size-2.5 text-muted-foreground" />
                      <span>{city}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* List of Pinned Cities */}
            <div className="space-y-2">
              {pinnedCities.length === 0 ? (
                <Empty className="py-8 border border-dashed border-border rounded-lg bg-card/40">
                  <EmptyHeader>
                    <EmptyMedia>
                      <IconStack aria-hidden="true" className="text-primary h-20 w-18">
                        <MapPin className="text-primary size-4" />
                      </IconStack>
                    </EmptyMedia>
                    <EmptyTitle>No Pinned Stations</EmptyTitle>
                    <EmptyDescription>
                      Add frequent locations or research observatories above for instant one-click synoptic access.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                pinnedCities.map((cityName) => (
                  <Card
                    key={cityName}
                    className="flex items-center justify-between p-3 border border-border bg-card hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <MapPin className="size-3.5" />
                      </div>
                      <div>
                        <div className="font-heading font-semibold text-xs text-foreground">{cityName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">Ground Station Telemetry</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          onSelectCity(cityName);
                          onOpenChange(false);
                        }}
                        className="h-7 px-2.5 text-xs gap-1 font-mono"
                      >
                        <Radio className="size-3 text-primary" />
                        <span>Load Station</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRemovePinnedCity(cityName)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB 4: REGIONAL */}
          <TabsContent value="localization" className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 focus-visible:outline-none">
            {/* Language Selection */}
            <Card className="p-4 border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <span className="font-heading font-semibold text-xs text-foreground">Language & Regional Dialect</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30">
                  {settings.language}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Applies translated weather conditions, AI synoptic advisories & regional Google speech synthesis.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { code: "en", label: "English", region: "International" },
                  { code: "es", label: "Español", region: "España / Latinoamérica" },
                  { code: "fr", label: "Français", region: "France / Francophonie" },
                  { code: "de", label: "Deutsch", region: "Deutschland / Österreich" },
                  { code: "ja", label: "日本語", region: "Japan" },
                  { code: "hi", label: "हिन्दी", region: "India" },
                ].map((lang) => {
                  const isSelected = settings.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => onUpdateSettings({ language: lang.code })}
                      className={cn(
                        "p-2.5 text-left border rounded-md transition-all cursor-pointer flex flex-col justify-between",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                          : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-semibold text-xs text-foreground">{lang.label}</span>
                        {isSelected && <Check className="size-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 truncate font-mono">
                        {lang.region}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Time Representation */}
            <Card className="p-4 border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="font-heading font-semibold text-xs text-foreground">Time Representation</span>
                </div>
                {currentTime && (
                  <Badge variant="outline" className="font-mono text-xs">
                    Live:{" "}
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: settings.timeFormat === "12h",
                    })}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Chronological representation used across hourly charts, solar ephemeris & daily outlooks.
              </p>

              <ToggleGroup
                type="single"
                value={settings.timeFormat}
                onValueChange={(val) => {
                  if (val) onUpdateSettings({ timeFormat: val as "12h" | "24h" });
                }}
                className="grid grid-cols-2 gap-2 pt-1 w-full"
              >
                <ToggleGroupItem value="24h" className="w-full justify-center text-xs py-2 h-auto">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">24-Hour Military Format</span>
                    <span className="text-[10px] text-muted-foreground font-mono">14:30 / 23:15</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="12h" className="w-full justify-center text-xs py-2 h-auto">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">12-Hour Standard Format</span>
                    <span className="text-[10px] text-muted-foreground font-mono">2:30 PM / 11:15 PM</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </Card>

            <Alert variant="info" className="text-xs">
              <AlertTitle className="text-xs font-semibold">Localized AI Synoptic Intelligence</AlertTitle>
              <AlertDescription className="text-xs mt-0.5 leading-relaxed">
                Weather advice banners, sudden change warnings, and speech synthesis dynamically translate into your chosen regional language.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* TAB 5: SPEECH & AUDIO */}
          <TabsContent value="speech" className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 focus-visible:outline-none">
            {/* Engine Header & Live Preview */}
            <Alert variant="default" className="bg-card border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                    <Sparkles className="size-3.5" />
                  </div>
                  <span className="font-heading font-semibold text-xs text-foreground">Google Text-to-Speech Engine</span>
                  <Badge
                    variant="outline"
                    className="h-4 px-1.5 text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10"
                  >
                    ONLINE
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Synthesized via Google Neural2, Journey & Studio multi-voice models with natural prosody
                </div>
              </div>

              {/* Live Preview Button */}
              <Button
                type="button"
                variant={isPlayingPreview ? "default" : "outline"}
                size="sm"
                onClick={handleTogglePreviewVoice}
                className={cn(
                  "h-8 px-3 font-mono text-xs gap-2 shrink-0 transition-all shadow-2xs",
                  isPlayingPreview && "bg-primary text-primary-foreground animate-pulse"
                )}
              >
                {isPlayingPreview ? (
                  <>
                    <Square className="size-3 fill-current" />
                    <span>Stop Preview</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-3.5 text-primary" />
                    <span>Preview Voice</span>
                  </>
                )}
              </Button>
            </Alert>

            {/* 1. Google Model Architecture */}
            <Card className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-xs text-foreground">Google TTS Model Architecture</span>
                <Badge variant="secondary" className="font-mono text-[10px] py-0 h-4 border border-border">
                  {settings.googleTtsModel?.toUpperCase() || "JOURNEY"}
                </Badge>
              </div>
              <ToggleGroup
                type="single"
                value={settings.googleTtsModel || "Journey"}
                onValueChange={(val) => {
                  if (val) {
                    const newModel = val as GoogleTtsModel;
                    const matchingVoices = getAvailableGoogleVoices(settings.language, newModel);
                    const bestVoice = matchingVoices[0]?.id || settings.googleTtsVoice;
                    onUpdateSettings({
                      googleTtsModel: newModel,
                      googleTtsVoice: bestVoice,
                    });
                  }
                }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 w-full"
              >
                {GOOGLE_TTS_MODELS.map((m) => (
                  <ToggleGroupItem
                    key={m.id}
                    value={m.id}
                    className="w-full justify-center flex flex-col items-center py-2 h-auto text-center"
                  >
                    <span className="font-semibold text-xs">{m.name}</span>
                    <span className="text-[9px] opacity-70 uppercase tracking-tight">{m.badge}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <div className="text-[11px] text-muted-foreground pt-0.5 italic">
                {GOOGLE_TTS_MODELS.find((m) => m.id === (settings.googleTtsModel || "Journey"))?.description}
              </div>
            </Card>

            {/* 2. Voice Persona & Character */}
            <Card className="p-4 border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-xs text-foreground">Voice Persona & Synoptic Cadence</span>
                <span className="text-primary font-mono text-[11px] font-semibold truncate max-w-[220px]">
                  {settings.googleTtsVoice}
                </span>
              </div>
              <ScrollArea className="max-h-52 pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {getAvailableGoogleVoices(settings.language, settings.googleTtsModel).map((v) => {
                    const isSelected = settings.googleTtsVoice === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            googleTtsVoice: v.id,
                            googleTtsModel: v.model,
                          })
                        }
                        className={cn(
                          "p-2.5 text-left border rounded-md transition-all flex items-start justify-between gap-2 group cursor-pointer",
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-xs"
                            : "border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                            <span>{v.name}</span>
                            <span
                              className={cn(
                                "text-[9px] uppercase px-1 py-0 rounded-sm border font-mono",
                                v.gender === "FEMALE"
                                  ? "border-pink-500/30 text-pink-600 dark:text-pink-400 bg-pink-500/5"
                                  : "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5"
                              )}
                            >
                              {v.gender === "FEMALE" ? "Female" : "Male"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                            {v.description}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>

            {/* 3. Speed & Tone (Pitch) Modulation Row with shadcn Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Speech Velocity / Speed Slider */}
              <Card className="p-3.5 border border-border bg-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-xs text-foreground">Speech Velocity (Speed)</span>
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                    {settings.speechRate.toFixed(2)}x
                  </Badge>
                </div>
                <Slider
                  value={[settings.speechRate]}
                  min={0.6}
                  max={1.6}
                  step={0.05}
                  onValueChange={(val) => {
                    if (val[0] !== undefined) onUpdateSettings({ speechRate: Number(val[0].toFixed(2)) });
                  }}
                  className="py-1"
                />
                <div className="flex justify-between gap-1 pt-1">
                  {[0.8, 1.0, 1.2, 1.4].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => onUpdateSettings({ speechRate: rate })}
                      className={cn(
                        "flex-1 py-1 text-center font-mono text-[11px] rounded-md border transition-colors cursor-pointer",
                        settings.speechRate === rate
                          ? "bg-primary/10 border-primary text-primary font-bold"
                          : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </Card>

              {/* Tone / Pitch Modulation Slider */}
              <Card className="p-3.5 border border-border bg-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-xs text-foreground">Voice Tone (Pitch)</span>
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                    {settings.googleTtsPitch > 0 ? `+${settings.googleTtsPitch}` : settings.googleTtsPitch} st
                  </Badge>
                </div>
                <Slider
                  value={[settings.googleTtsPitch]}
                  min={-6}
                  max={6}
                  step={0.5}
                  onValueChange={(val) => {
                    if (val[0] !== undefined) onUpdateSettings({ googleTtsPitch: Number(val[0].toFixed(1)) });
                  }}
                  className="py-1"
                />
                <div className="flex justify-between gap-1 pt-1">
                  {GOOGLE_TTS_PITCH_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => onUpdateSettings({ googleTtsPitch: p.value })}
                      className={cn(
                        "flex-1 py-1 text-center font-mono text-[11px] rounded-md border transition-colors cursor-pointer",
                        settings.googleTtsPitch === p.value
                          ? "bg-primary/10 border-primary text-primary font-bold"
                          : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* 4. Acoustic Audio Profile (EQ) & Volume Gain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Audio Profile */}
              <Card className="p-3.5 border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-xs text-foreground">Acoustic Device Profile (EQ)</span>
                  <Headphones className="size-3.5 text-muted-foreground" />
                </div>
                <ToggleGroup
                  type="single"
                  value={settings.googleTtsAudioProfile || "headphone-class-device"}
                  onValueChange={(val) => {
                    if (val) onUpdateSettings({ googleTtsAudioProfile: val as GoogleTtsAudioProfile });
                  }}
                  className="grid grid-cols-2 gap-1.5 pt-1 w-full"
                >
                  {GOOGLE_TTS_AUDIO_PROFILES.map((prof) => (
                    <ToggleGroupItem
                      key={prof.id}
                      value={prof.id}
                      className="w-full justify-center text-center py-2 h-auto flex flex-col"
                    >
                      <span className="font-semibold text-xs">{prof.label}</span>
                      <span className="text-[10px] opacity-70 truncate max-w-full">
                        {prof.description.slice(0, 20)}...
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Card>

              {/* Volume Gain (dB) Slider */}
              <Card className="p-3.5 border border-border bg-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-xs text-foreground">Output Volume Gain</span>
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                    {settings.googleTtsVolumeGain > 0 ? `+${settings.googleTtsVolumeGain}` : settings.googleTtsVolumeGain} dB
                  </Badge>
                </div>
                <Slider
                  value={[settings.googleTtsVolumeGain]}
                  min={-6}
                  max={6}
                  step={0.5}
                  onValueChange={(val) => {
                    if (val[0] !== undefined) onUpdateSettings({ googleTtsVolumeGain: Number(val[0].toFixed(1)) });
                  }}
                  className="py-1"
                />
                <div className="flex justify-between gap-1 pt-1">
                  {GOOGLE_TTS_VOLUME_PRESETS.map((vol) => (
                    <button
                      key={vol.value}
                      type="button"
                      onClick={() => onUpdateSettings({ googleTtsVolumeGain: vol.value })}
                      className={cn(
                        "flex-1 py-1 text-center font-mono text-[11px] rounded-md border transition-colors cursor-pointer",
                        settings.googleTtsVolumeGain === vol.value
                          ? "bg-primary/10 border-primary text-primary font-bold"
                          : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <span>{vol.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* 5. Automatic Audio Briefing with shadcn Switch */}
            <Card className="p-4 border border-border bg-card flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto-briefing-switch" className="font-heading font-semibold text-xs text-foreground cursor-pointer">
                  Automatic Audio Meteorological Briefing
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Read aloud synopsis automatically via Google Neural TTS upon station selection or initialization
                </p>
              </div>
              <Switch
                id="auto-briefing-switch"
                checked={settings.autoSpeakOnLoad}
                onCheckedChange={(checked) => onUpdateSettings({ autoSpeakOnLoad: checked })}
              />
            </Card>

            {/* 6. Custom Google Cloud API Key */}
            <Card className="p-4 border border-border bg-card space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Key className="size-3.5 text-primary" />
                  <span>Custom Google Cloud API Key</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                  {settings.googleApiKey?.trim() ? "Dedicated Key Set" : "Standard Keyless Active"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showGoogleKey ? "text" : "password"}
                    placeholder="AIzaSy... (Leave empty for default free Google synthesis)"
                    value={settings.googleApiKey || ""}
                    onChange={(e) => onUpdateSettings({ googleApiKey: e.target.value })}
                    className="h-8 pr-8 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showGoogleKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
                {settings.googleApiKey && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateSettings({ googleApiKey: "" })}
                    className="h-8 px-2.5 font-mono text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Zero configuration required: OpenWeather integrates with Google neural voice synthesis out-of-the-box with browser failover. Provide a Google Cloud key for dedicated enterprise quota.
              </p>
            </Card>
          </TabsContent>

          {/* TAB 6: THEME */}
          <TabsContent value="appearance" className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 focus-visible:outline-none">
            <Card className="p-4 border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SunMoon className="size-4 text-primary" />
                  <span className="font-heading font-semibold text-xs text-foreground">Theme Mode & Atmosphere</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs uppercase text-primary border-primary/30">
                  {mounted ? theme : "dark"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                High-contrast terminal aesthetic optimized for day and nighttime meteorological radar observation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    id: "dark",
                    title: "Dark Synoptic",
                    desc: "Optimal for radar observation & low eye strain",
                    icon: Moon,
                    swatch: "bg-zinc-950 border-zinc-800 text-zinc-100",
                  },
                  {
                    id: "light",
                    title: "Light Daylight",
                    desc: "Crisp high-contrast daytime telemetry",
                    icon: Sun,
                    swatch: "bg-zinc-50 border-zinc-200 text-zinc-900",
                  },
                  {
                    id: "system",
                    title: "System Synced",
                    desc: "Dynamically matches OS appearance",
                    icon: Laptop,
                    swatch: "bg-gradient-to-r from-zinc-900 to-zinc-100 border-zinc-400 text-foreground",
                  },
                ].map((item) => {
                  const isSelected = mounted && theme === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id)}
                      className={cn(
                        "p-3.5 border rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between group",
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="size-8 rounded-md bg-muted/60 border border-border flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
                            <Icon className="size-4" />
                          </div>
                          {isSelected ? (
                            <div className="size-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xs">
                              <Check className="size-3 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="size-4.5 rounded-full border border-border group-hover:border-primary/40" />
                          )}
                        </div>
                        <div className="font-heading font-semibold text-xs text-foreground mt-3">
                          {item.title}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/60">
                        <div className={cn("h-6 rounded border flex items-center px-2 text-[10px] font-mono", item.swatch)}>
                          Preview Swatch
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DIALOG FOOTER */}
        <DialogFooter className="border-t border-border p-3 sm:p-4 px-5 shrink-0 flex items-center justify-between sm:justify-between w-full bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetSettings}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 font-sans"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset All Defaults</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs px-5 h-8 gap-1.5 shadow-2xs"
          >
            <Check className="size-3.5 stroke-[2.5]" />
            <span>Done</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
