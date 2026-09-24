"use client"

import * as React from "react"
import {
  Sparkles,
  Sliders,
  Volume2,
  ChevronDown,
  History,
  Check,
  Users,
  User,
  UserCheck,
  Play,
  Pause,
  Square,
  MessageSquareQuote,
  Info,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TTS_ENGINE_NAME,
  TTS_PITCH_PRESETS,
  TTS_VOLUME_PRESETS,
} from "@/lib/edge-tts"
import { useTranslation } from "@/components/language-provider"
import { useSpeechPreview } from "@/hooks"
import { PREVIEW_SAMPLE_TEXT } from "@/hooks/use-speech-preview"
import { cn } from "@/lib/utils"
import type { SpeechDeliveryStyle, TabBaseProps } from "../../types"
import { useSpeechTab } from "../../hooks"
import { DELIVERY_STYLES } from "../../constants"
import { SettingSliderCard, AudioToneVisualizer } from "../widgets"
import { Spinner } from "@/components/ui/spinner"
import { IconTile } from "@/components/reui/icon-tile"

export function SpeechTabContent({ settings, onUpdateSettings }: TabBaseProps) {
  const { t } = useTranslation()
  const text = t.settingsDialog.speech
  const toneLabel = (tone: string) =>
    (text.tones as Record<string, string>)[tone] ?? tone
  const {
    playbackStatus,
    currentTime,
    duration,
    activeProvider,
    readLevels,
    getPosition,
    handleTogglePreviewVoice,
    handleStopPreview,
    handlePausePreview,
    handleResumePreview,
    handleSeek,
  } = useSpeechPreview({ settings })

  const {
    activeVoice,
    selectedTone,
    setSelectedTone,
    availableTones,
    filteredAllVoices,
    filteredMaleVoices,
    filteredFemaleVoices,
    recentVoices,
    handleSelectVoice,
  } = useSpeechTab({
    settings,
    onUpdateSettings,
    onStopPreview: handleStopPreview,
  })

  const deliveryStyle = settings.speechDeliveryStyle || "meteorological"
  const deliveryStyleLabelId = React.useId()
  const volumeGain = Math.min(0, settings.googleTtsVolumeGain)
  const previewActionLabel =
    playbackStatus === "playing"
      ? text.pausePreview
      : playbackStatus === "paused"
      ? text.resumePreview
      : text.playPreview
  const isGenericVoice = activeProvider === "web-speech"

  return (
    <div className="space-y-4">
      {/* 1. Engine Header & Credentials Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>{text.engineTitle}</span>
              <Badge
                variant="success-outline"
                className="font-mono text-tiny tracking-wider"
              >
                {TTS_ENGINE_NAME}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* 2. Voice Persona Selection using DropdownMenu with Submenus */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Volume2 className="size-4 text-primary" />
              <span>{text.personaTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {text.personaDesc}
            </CardDescription>
          </div>
          <CardAction>
            {/* SELECT-STYLE DROPDOWN SUB-MENU COMPONENT */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto min-w-56 justify-between gap-2"
                  />
                }
              >
                <div className="flex items-center gap-2 truncate text-left">
                  <div className="flex size-4.5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <Volume2 className="size-3" />
                  </div>
                  <span className="font-heading font-semibold text-foreground truncate">
                    {activeVoice.name}
                  </span>
                  <Badge
                    variant={
                      activeVoice.gender === "FEMALE"
                        ? "primary-light"
                        : "outline"
                    }
                    className="font-mono text-tiny uppercase"
                  >
                    {toneLabel(activeVoice.tone)}
                  </Badge>
                  {selectedTone && (
                    <Badge variant="primary-light" className="font-mono text-nano uppercase">
                      {toneLabel(selectedTone)}
                    </Badge>
                  )}
                </div>
                <ChevronDown className="size-3.5 opacity-60 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 sm:w-80 pt-2">
                {/* 1. Recent Choose Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 flex items-center gap-1.5 font-mono text-tiny text-muted-foreground uppercase tracking-wider">
                    <History className="size-3 text-primary" />
                    <span>{text.recentVoices}</span>
                  </DropdownMenuLabel>
                  {recentVoices.map((v) => {
                    const isSelected = activeVoice.id === v.id
                    return (
                      <DropdownMenuItem
                        key={`recent-${v.id}`}
                        onClick={() => handleSelectVoice(v.id)}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-heading text-xs font-medium text-foreground truncate">
                            {v.name}
                          </span>
                          <span className="font-mono text-tiny text-muted-foreground">
                            ({toneLabel(v.tone)})
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="size-3 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* 2. Filter by Tone (keyboard-navigable radio items) */}
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-3.5 text-primary" />
                        <span>{text.filterByTone}</span>
                      </div>
                      <span className="font-mono text-nano text-muted-foreground ml-auto pr-1">
                        {selectedTone ? toneLabel(selectedTone) : text.allTonesShort}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-44">
                        <DropdownMenuRadioGroup
                          value={selectedTone ?? ""}
                          onValueChange={(val) => setSelectedTone(val || null)}
                        >
                          <DropdownMenuRadioItem
                            value=""
                            onSelect={(e) => e.preventDefault()}
                          >
                            {text.allTones}
                          </DropdownMenuRadioItem>
                          {availableTones.map((tone) => (
                            <DropdownMenuRadioItem
                              key={tone}
                              value={tone}
                              onSelect={(e) => e.preventDefault()}
                            >
                              {toneLabel(tone)}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* 3. Submenus: All, Male, Female (Filtered by Tone) */}
                <DropdownMenuGroup>
                  {/* All Voices Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-primary" />
                        <span>{text.allVoices}</span>
                      </div>
                      <span className="font-mono text-nano text-muted-foreground ml-auto pr-1">
                        {filteredAllVoices.length}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-64 max-h-96 overflow-y-auto">
                        {filteredAllVoices.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            {text.noVoicesWithTone(toneLabel(selectedTone ?? ""))}
                          </div>
                        ) : (
                          filteredAllVoices.map((v) => {
                            const isSelected = activeVoice.id === v.id
                            return (
                              <DropdownMenuItem
                                key={`all-${v.id}`}
                                onClick={() => handleSelectVoice(v.id)}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                                  <span className="font-heading text-xs font-medium text-foreground truncate">
                                    {v.name}
                                  </span>
                                  <Badge
                                    variant={
                                      v.gender === "FEMALE"
                                        ? "primary-light"
                                        : "outline"
                                    }
                                    className="font-mono text-nano px-1 py-0 uppercase"
                                  >
                                    {toneLabel(v.tone)}
                                  </Badge>
                                </div>
                                {isSelected && (
                                  <Check className="size-3 text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  {/* Male Voices Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-sky-500" />
                        <span>{text.maleVoices}</span>
                      </div>
                      <span className="font-mono text-nano text-muted-foreground ml-auto pr-1">
                        {filteredMaleVoices.length}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-64 max-h-72 overflow-y-auto">
                        {filteredMaleVoices.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            {text.noMaleVoicesWithTone(toneLabel(selectedTone ?? ""))}
                          </div>
                        ) : (
                          filteredMaleVoices.map((v) => {
                            const isSelected = activeVoice.id === v.id
                            return (
                              <DropdownMenuItem
                                key={`male-${v.id}`}
                                onClick={() => handleSelectVoice(v.id)}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                                  <span className="font-heading text-xs font-medium text-foreground truncate">
                                    {v.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-nano px-1 py-0 uppercase"
                                  >
                                    {toneLabel(v.tone)}
                                  </Badge>
                                </div>
                                {isSelected && (
                                  <Check className="size-3 text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  {/* Female Voices Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-3.5 text-primary" />
                        <span>{text.femaleVoices}</span>
                      </div>
                      <span className="font-mono text-nano text-muted-foreground ml-auto pr-1">
                        {filteredFemaleVoices.length}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-64 max-h-72 overflow-y-auto">
                        {filteredFemaleVoices.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            {text.noFemaleVoicesWithTone(toneLabel(selectedTone ?? ""))}
                          </div>
                        ) : (
                          filteredFemaleVoices.map((v) => {
                            const isSelected = activeVoice.id === v.id
                            return (
                              <DropdownMenuItem
                                key={`female-${v.id}`}
                                onClick={() => handleSelectVoice(v.id)}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                                  <span className="font-heading text-xs font-medium text-foreground truncate">
                                    {v.name}
                                  </span>
                                  <Badge
                                    variant="primary-light"
                                    className="font-mono text-nano px-1 py-0 uppercase"
                                  >
                                    {toneLabel(v.tone)}
                                  </Badge>
                                </div>
                                {isSelected && (
                                  <Check className="size-3 text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Active Voice Showcase & Live Audition inside Alert */}
          <Alert
            variant="warning"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                {/* Voice Transducer Visual Indicator */}
                <IconTile
                  asChild
                  size="default"
                  variant={
                    playbackStatus === "playing"
                      ? "soft"
                      : playbackStatus === "paused"
                      ? "soft"
                      : "outline"
                  }
                  className={cn(
                    "cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
                    playbackStatus === "playing"
                      ? "text-primary shadow-xs ring-2 ring-primary/25"
                      : playbackStatus === "paused"
                      ? "text-amber-500"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePreviewVoice(activeVoice)}
                    disabled={playbackStatus === "loading"}
                    title={previewActionLabel}
                    aria-label={previewActionLabel}
                  >
                    <Volume2
                      className={cn(
                        "size-5 transition-transform",
                        playbackStatus === "playing" && "animate-pulse scale-110"
                      )}
                    />
                  </button>
                </IconTile>

                {/* Voice Meta */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      {activeVoice.name}
                    </span>
                    <Badge
                      variant={
                        activeVoice.gender === "FEMALE"
                          ? "primary-light"
                          : "outline"
                      }
                      className="font-mono text-nano uppercase"
                    >
                      {toneLabel(activeVoice.tone)}
                    </Badge>
                    <span className="font-mono text-nano text-muted-foreground">
                      • {activeVoice.gender === "FEMALE" ? text.female : text.male}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeVoice.description}
                  </p>
                </div>
              </div>

              {/* Single, Realtime Action Controls */}
              <div className="flex items-center gap-2 self-end shrink-0">
                {playbackStatus === "loading" ? (
                  <Button
                    type="button"
                    disabled
                    variant="outline"
                    size="sm"
                    className="gap-1.5 font-mono text-xs cursor-wait"
                  >
                    <Spinner className="size-3.5" />
                    <span>{text.loading}</span>
                  </Button>
                ) : playbackStatus === "playing" ? (
                  <>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handlePausePreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Pause className="size-3.5 fill-current" />
                      <span>{text.pause}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleStopPreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Square className="size-3 fill-current" />
                      <span>{text.stop}</span>
                    </Button>
                  </>
                ) : playbackStatus === "paused" ? (
                  <>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleResumePreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>{text.resume}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStopPreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Square className="size-3 fill-current" />
                      <span>{text.stop}</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => handleTogglePreviewVoice(activeVoice)}
                    className="gap-1.5 font-mono text-xs cursor-pointer"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>{text.playAudition}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Realtime Audio Tone & Pitch Visualizer + Scrubber */}
            <AudioToneVisualizer
              status={playbackStatus}
              tone={activeVoice.tone}
              pitch={
                activeProvider === "web-speech"
                  ? settings.googleTtsPitch
                  : undefined
              }
              speed={settings.speechRate}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              readLevels={readLevels}
              getPosition={getPosition}
            />

            {/* Sample Weather Script */}
            <div className="border-t border-primary/15 pt-2 flex items-baseline gap-2 text-foreground/80">
              <span className="font-mono text-nano uppercase tracking-wider text-primary font-semibold shrink-0">
                {text.script}
              </span>
              <p className="text-tiny italic font-serif leading-relaxed">
                &ldquo;{PREVIEW_SAMPLE_TEXT}&rdquo;
              </p>
            </div>

            {isGenericVoice && (
              <p
                className="flex items-start gap-1.5 text-tiny text-muted-foreground"
                role="status"
              >
                <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                <span>
                  {text.genericVoiceNotice(activeVoice.name)}
                </span>
              </p>
            )}
          </Alert>
        </CardContent>
      </Card>

      {/* 3 & 4. Speech Velocity & Pitch Modulation (Side by Side) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 3. Speech Velocity (browser playback rate) */}
        <SettingSliderCard
          icon={Volume2}
          title={text.velocityTitle}
          description={text.velocityDesc}
          badgeText={`${settings.speechRate.toFixed(2)}x`}
          valueText={text.velocityValueText(settings.speechRate.toFixed(2))}
          value={settings.speechRate}
          min={0.6}
          max={1.6}
          step={0.05}
          decimals={2}
          onValueChange={(speechRate) => onUpdateSettings({ speechRate })}
          presets={[
            { value: 0.8, label: "0.8x" },
            { value: 1.0, label: "1.0x" },
            { value: 1.2, label: "1.2x" },
            { value: 1.4, label: "1.4x" },
          ]}
        />

        {/* 4. Voice Pitch Modulation (browser fallback only) */}
        <SettingSliderCard
          icon={Sliders}
          title={text.pitchTitle}
          description={text.pitchDesc}
          badgeText={`${settings.googleTtsPitch > 0 ? "+" : ""}${settings.googleTtsPitch.toFixed(1)}st`}
          valueText={text.pitchValueText(settings.googleTtsPitch)}
          value={settings.googleTtsPitch}
          min={-4.0}
          max={4.0}
          step={0.5}
          decimals={1}
          onValueChange={(googleTtsPitch) => onUpdateSettings({ googleTtsPitch })}
          presets={TTS_PITCH_PRESETS}
        />
      </div>

      {/* 5. Volume Gain Calibration (browser playback gain) */}
      <SettingSliderCard
        icon={Volume2}
        title={text.volumeTitle}
        description={text.volumeDesc}
        badgeText={`${volumeGain.toFixed(1)} dB`}
        valueText={text.volumeValueText(volumeGain.toFixed(1))}
        value={volumeGain}
        min={-12.0}
        max={0}
        step={0.5}
        decimals={1}
        onValueChange={(googleTtsVolumeGain) =>
          onUpdateSettings({ googleTtsVolumeGain })
        }
        presets={TTS_VOLUME_PRESETS}
      />

      {/* 5. Automatic Audio Briefing Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Volume2 className="size-4 text-primary" />
            <Label
              htmlFor="auto-briefing-switch"
              className="cursor-pointer font-heading text-xs font-semibold text-foreground"
            >
              {text.autoBriefingTitle}
            </Label>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {text.autoBriefingDesc}
          </CardDescription>
          <CardAction>
            <Switch
              id="auto-briefing-switch"
              checked={settings.autoSpeakOnLoad}
              onCheckedChange={(checked) =>
                onUpdateSettings({ autoSpeakOnLoad: checked })
              }
            />
          </CardAction>
        </CardHeader>
      </Card>

      {/* 6. Delivery Style (sent as SSML prosody) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <MessageSquareQuote className="size-4 text-primary" />
            <span id={deliveryStyleLabelId}>{text.deliveryTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {text.deliveryDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={deliveryStyle}
            onValueChange={(val) => {
              if (val) {
                onUpdateSettings({
                  speechDeliveryStyle: val as SpeechDeliveryStyle,
                })
              }
            }}
            aria-labelledby={deliveryStyleLabelId}
            className="flex w-full flex-wrap gap-1.5"
          >
            {DELIVERY_STYLES.map((style) => (
              <ToggleGroupItem
                key={style}
                value={style}
                className={cn(
                  "font-mono text-tiny border px-2.5",
                  deliveryStyle === style
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {text.deliveryStyles[style]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>
    </div>
  )
}
