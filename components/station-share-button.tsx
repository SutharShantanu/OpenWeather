"use client"

import React, { useState, useCallback } from "react"
import {
  Share2,
  Check,
  Copy,
  ChevronDown,
  ExternalLink,
  Smartphone,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { CurrentWeather, formatTemperature } from "@/lib/weather"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-provider"

interface StationShareButtonProps {
  current: CurrentWeather
  unit: "C" | "F"
  className?: string
}

export function StationShareButton({
  current,
  unit,
  className,
}: StationShareButtonProps) {
  const { t, translateCondition } = useTranslation()
  const [copied, setCopied] = useState(false)

  // Construct canonical deep-link URL that correctly restores the exact station
  const buildCanonicalUrl = useCallback(() => {
    if (typeof window === "undefined") return ""
    const url = new URL(window.location.origin)
    if (typeof current.lat === "number" && typeof current.lon === "number") {
      url.searchParams.set("lat", current.lat.toFixed(4))
      url.searchParams.set("lon", current.lon.toFixed(4))
    }
    if (current.cityName) {
      url.searchParams.set("city", current.cityName)
    }
    return url.toString()
  }, [current.lat, current.lon, current.cityName])

  const targetUrl = React.useSyncExternalStore(
    () => () => {},
    () => buildCanonicalUrl(),
    () => ""
  )

  const canShare = React.useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false
  )

  const displayTemp = formatTemperature(current.temp, unit)
  const displayFeelsLike = formatTemperature(current.feelsLike, unit)
  const conditionText = translateCondition(current.condition.description)

  const shareText = `Live weather for ${current.cityName}: ${displayTemp}°${unit}, ${conditionText} (Feels like ${displayFeelsLike}°${unit}) • Track on OpenWeather`

  const handleCopyLink = async () => {
    const url = targetUrl || buildCanonicalUrl()
    if (!url) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleNativeShare = async () => {
    const url = targetUrl || buildCanonicalUrl()
    if (!url || typeof navigator === "undefined" || !navigator.share) return

    try {
      await navigator.share({
        title: `${current.cityName} Weather — OpenWeather`,
        text: shareText,
        url,
      })
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error("Native share failed:", error)
      }
    }
  }

  // Social direct redirect URLs
  const resolvedUrl = targetUrl || buildCanonicalUrl()
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resolvedUrl)}`
  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${resolvedUrl}`)}`
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(resolvedUrl)}&text=${encodeURIComponent(shareText)}`
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(`Live Weather: ${current.cityName} (${displayTemp}°${unit})`)}&body=${encodeURIComponent(`${shareText}\n\nStation Telemetry Link:\n${resolvedUrl}`)}`

  const socialChannels = [
    {
      id: "x",
      name: "X",
      label: "Share on X",
      url: xShareUrl,
      src: "https://thesvg.org/icons/x/default.svg",
      className: "dark:invert",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      label: "Share on WhatsApp",
      url: whatsAppShareUrl,
      src: "https://thesvg.org/icons/whatsapp/default.svg",
    },
    {
      id: "telegram",
      name: "Telegram",
      label: "Share on Telegram",
      url: telegramShareUrl,
      src: "https://thesvg.org/icons/telegram/default.svg",
    },
    {
      id: "email",
      name: "Email",
      label: "Send via Email",
      url: emailShareUrl,
      src: "https://thesvg.org/icons/gmail/default.svg",
      isMailto: true,
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className ?? "gap-1.5 font-mono text-xs"}
          title={t.common.shareStation}
          aria-label={t.common.shareStation}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-500" />
              <span className="hidden text-emerald-600 sm:inline dark:text-emerald-500">
                {t.common.copied}
              </span>
            </>
          ) : (
            <>
              <Share2 className="size-3.5 text-muted-foreground" />
              <span className="hidden uppercase sm:inline">
                {t.common.shareStation}
              </span>
            </>
          )}
          <ChevronDown className="size-3 text-muted-foreground/70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-68 font-mono text-xs">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-nano tracking-wider text-muted-foreground uppercase">
          <Compass className="size-3 text-primary" />
          <span>{current.cityName} Telemetry</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 1. Quick Copy Action */}
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer gap-2"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
          <span className="flex-1 font-semibold">
            {copied ? t.common.copied : "Copy Station Link"}
          </span>
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* 2. Device Native Share Sheet */}
        {canShare && (
          <DropdownMenuItem
            onClick={handleNativeShare}
            className="cursor-pointer gap-2"
          >
            <Smartphone className="size-3.5 text-primary" />
            <span className="flex-1">Device Share Sheet</span>
            <ExternalLink className="size-3 text-muted-foreground opacity-60" />
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* 3. Social Redirect & Share Grid */}
        <div className="p-1.5">
          <div className="mb-1.5 px-1 font-mono text-nano font-semibold tracking-wider text-muted-foreground uppercase">
            Redirect & Share
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {socialChannels.map((channel) => (
              <DropdownMenuItem
                key={channel.id}
                asChild
                className="flex flex-col items-center justify-center gap-1 rounded-md border border-border/40 bg-muted/20 p-2 text-center transition-all hover:bg-accent hover:border-border hover:shadow-xs focus:bg-accent focus:text-accent-foreground cursor-pointer group"
              >
                <a
                  href={channel.url}
                  target={channel.isMailto ? undefined : "_blank"}
                  rel={channel.isMailto ? undefined : "noopener noreferrer"}
                  title={channel.label}
                  aria-label={channel.label}
                >
                  <div className="flex size-6 items-center justify-center transition-transform group-hover:scale-110">
                    <Image
                      src={channel.src}
                      alt={channel.name}
                      width={24}
                      height={24}
                      className={cn(
                        "size-5 shrink-0 object-contain",
                        channel.className
                      )}
                      unoptimized
                    />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-muted-foreground group-hover:text-foreground">
                    {channel.name}
                  </span>
                  <span className="sr-only">{channel.label}</span>
                </a>
              </DropdownMenuItem>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 4. Open Station Deep-Link in New Tab */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            <span className="flex-1">Open Direct Link</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
