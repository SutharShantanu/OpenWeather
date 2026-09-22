"use client"

import React, { useState } from "react"
import { Key, Sparkles, Eye, EyeOff } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dot } from "@/components/ui/dot"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { CONFIG } from "@/lib/config"
import { DEFAULT_GOOGLE_AI_KEY } from "@/lib/constants"
import { TabBaseProps } from "./types"

export function ApiKeysTabContent({ settings, onUpdateSettings, city }: TabBaseProps) {
  const [showOwmKey, setShowOwmKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)

  const [owmTestStatus, setOwmTestStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [owmTestMsg, setOwmTestMsg] = useState("")

  const [geminiTestStatus, setGeminiTestStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [geminiTestMsg, setGeminiTestMsg] = useState("")

  const handleTestOpenWeatherKey = async () => {
    setOwmTestStatus("loading")
    setOwmTestMsg("Connecting to OpenWeather station...")
    try {
      const keyToTest = settings.customApiKey?.trim() || ""
      const targetQuery = city ? `city=${encodeURIComponent(city)}` : ""
      const url = keyToTest
        ? `/api/weather?${targetQuery ? `${targetQuery}&` : ""}source=openweathermap&apiKey=${encodeURIComponent(keyToTest)}`
        : `/api/weather?${targetQuery ? `${targetQuery}&` : ""}source=openweathermap`
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        if (
          json.providerName?.includes("Failover") ||
          json.stationName?.includes("Failover")
        ) {
          setOwmTestStatus("error")
          setOwmTestMsg(
            "Authentication failed. Please verify your OpenWeather API key."
          )
        } else {
          setOwmTestStatus("success")
          setOwmTestMsg(
            `Handshake Verified! Live telemetry: ${json.current?.cityName || city || "Station"} (${json.current?.temp}°C, ${json.current?.humidity}% humidity).`
          )
        }
      } else {
        setOwmTestStatus("error")
        setOwmTestMsg(`API responded with HTTP ${res.status}.`)
      }
    } catch {
      setOwmTestStatus("error")
      setOwmTestMsg("Network or gateway timeout testing station.")
    }
  }

  const handleTestGeminiKey = async () => {
    setGeminiTestStatus("loading")
    setGeminiTestMsg("Verifying Google AI credentials & TTS neural quota...")
    try {
      const keyToTest =
        settings.googleApiKey?.trim() ||
        CONFIG.keys.googleTtsApiKey ||
        DEFAULT_GOOGLE_AI_KEY
      const url = `/api/tts?apiKey=${encodeURIComponent(keyToTest)}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok && data.status === "ok") {
        setGeminiTestStatus("success")
        setGeminiTestMsg(
          `Handshake Verified! ${data.message || "Google Cloud TTS & Gemini speech quota active."}`
        )
      } else {
        setGeminiTestStatus("error")
        setGeminiTestMsg(
          data.error || "Authentication failed. Please verify your Google API key."
        )
      }
    } catch {
      setGeminiTestStatus("error")
      setGeminiTestMsg("Network or gateway timeout validating Google AI key.")
    }
  }

  const hasCustomOwm = Boolean(settings.customApiKey?.trim())
  const hasCustomGemini = Boolean(settings.googleApiKey?.trim())

  return (
    <div className="space-y-4">
      {/* Overview Alert */}
      <Alert
        variant="default"
        className="flex flex-wrap items-center justify-between gap-3 border-border bg-card p-3.5 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <Dot variant="success" size="lg" pulse />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
                API Authentication & Quotas
              </span>
              <Badge variant="primary-outline">CREDENTIALS</Badge>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Manage personal API keys for dedicated high-frequency telemetry & neural voice pipelines
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Badge
            variant="secondary"
            className="font-semibold tracking-wider uppercase"
          >
            {[hasCustomOwm, hasCustomGemini].filter(Boolean).length} / 2 Custom Set
          </Badge>
        </div>
      </Alert>

      {/* 1. OpenWeatherMap API Key Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Key className="size-4 text-primary" />
            <span>OpenWeatherMap API Key</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Supplies current weather observations, 3-hourly forecast projections, and geocoding services.
          </CardDescription>
          <CardAction>
            <Badge
              variant={hasCustomOwm ? "primary-light" : "primary-outline"}
              className="font-mono text-xs uppercase"
            >
              {hasCustomOwm ? "Custom Set" : "Server Shared"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <InputGroup>
            <InputGroupAddon>
              <Key className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type={showOwmKey ? "text" : "password"}
              value={settings.customApiKey || ""}
              onChange={(e) =>
                onUpdateSettings({ customApiKey: e.target.value })
              }
              placeholder="e.g. 4483c686af6e2e21072d875ed1e5be27"
              className="font-mono text-xs"
            />
            <InputGroupAddon align="inline-end" className="gap-1 pr-1.5">
              {hasCustomOwm && (
                <InputGroupButton
                  size="icon-sm"
                  variant="accent"
                  onClick={() => setShowOwmKey(!showOwmKey)}
                  title={showOwmKey ? "Hide key" : "Show key"}
                >
                  {showOwmKey ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </InputGroupButton>
              )}
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleTestOpenWeatherKey}
                disabled={owmTestStatus === "loading"}
                className="font-mono text-nano gap-1"
              >
                {owmTestStatus === "loading" && (
                  <Spinner className="size-3 text-primary" />
                )}
                <span>Test Connection</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>

          {owmTestMsg && (
            <Alert
              variant={owmTestStatus === "success" ? "success" : "destructive"}
              className="mt-1 py-2 text-xs"
            >
              <AlertTitle className="text-xs font-semibold">
                {owmTestStatus === "success"
                  ? "Handshake Verified"
                  : "Authentication Failure"}
              </AlertTitle>
              <AlertDescription className="mt-0.5 text-xs">
                {owmTestMsg}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-[11px] text-muted-foreground">
            Leave blank to utilize the shared server environment key. Obtain a dedicated API key at{" "}
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              openweathermap.org
            </a>
            .
          </p>
        </CardContent>
      </Card>

      {/* 2. Google AI / Gemini API Key Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>Google AI / Gemini TTS API Key</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Powers 30 controllable Gemini neural TTS voices with custom cadence, tone, and emotional delivery styles.
          </CardDescription>
          <CardAction>
            <Badge
              variant={hasCustomGemini ? "primary-light" : "primary-outline"}
              className="font-mono text-xs uppercase"
            >
              {hasCustomGemini ? "Custom Set" : "Studio Shared"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <InputGroup>
            <InputGroupAddon>
              <Key className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type={showGeminiKey ? "text" : "password"}
              value={settings.googleApiKey || ""}
              onChange={(e) =>
                onUpdateSettings({ googleApiKey: e.target.value })
              }
              placeholder="AIzaSy... (Gemini / Google AI API Key)"
              className="font-mono text-xs"
            />
            <InputGroupAddon align="inline-end" className="gap-1 pr-1.5">
              {hasCustomGemini && (
                <InputGroupButton
                  type="button"
                  variant="accent"
                  size="icon-sm"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  title={showGeminiKey ? "Hide API key" : "Show API key"}
                >
                  {showGeminiKey ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </InputGroupButton>
              )}
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleTestGeminiKey}
                disabled={geminiTestStatus === "loading"}
                className="font-mono text-nano gap-1"
              >
                {geminiTestStatus === "loading" && (
                  <Spinner className="size-3 text-primary" />
                )}
                <span>Test Key</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>

          {geminiTestMsg && (
            <Alert
              variant={geminiTestStatus === "success" ? "success" : "destructive"}
              className="mt-1 py-2 text-xs"
            >
              <AlertTitle className="text-xs font-semibold">
                {geminiTestStatus === "success"
                  ? "Handshake Verified"
                  : "Authentication Failure"}
              </AlertTitle>
              <AlertDescription className="mt-0.5 text-xs">
                {geminiTestMsg}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-[11px] text-muted-foreground">
            Obtain a free or tier-1 Gemini API key at{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              aistudio.google.com
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
