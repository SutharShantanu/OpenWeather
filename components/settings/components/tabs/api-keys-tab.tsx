"use client"

import React from "react"
import { Key, Eye, EyeOff, Map, History } from "lucide-react"
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
import {
  ItemGroup,
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-provider"
import { CONFIG } from "@/lib/config"
import type { Translations } from "@/lib/translations"
import type { TabBaseProps } from "../../types"
import { useApiKeyValidation, useApiKeyHistory } from "../../hooks"
import type { ApiKeyTestStatus } from "../../hooks/use-api-key-validation"

function testAlertVariant(status: ApiKeyTestStatus) {
  if (status === "success") return "success" as const
  if (status === "error") return "destructive" as const
  return "default" as const
}

function testAlertTitle(
  status: ApiKeyTestStatus,
  text: Translations["settingsDialog"]["apiKeys"]
) {
  if (status === "success") return text.keyVerified
  if (status === "error") return text.keyTestFailed
  return text.testingKey
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000)
  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

export function ApiKeysTabContent({
  settings,
  onUpdateSettings,
  city,
}: TabBaseProps) {
  const { t } = useTranslation()
  const text = t.settingsDialog.apiKeys
  const {
    showOwmKey,
    setShowOwmKey,
    owmTestStatus,
    owmTestMsg,
    hasCustomOwm,
    handleTestOpenWeatherKey,
    showCartoKey,
    setShowCartoKey,
    cartoTestStatus,
    cartoTestMsg,
    hasCustomCarto,
    handleTestCartoKey,
  } = useApiKeyValidation({
    customApiKey: settings.customApiKey,
    customCartoApiKey: settings.customCartoApiKey,
    city,
  })

  const { recordKey, owmHistory, cartoHistory } = useApiKeyHistory({
    activeOwmKey: settings.customApiKey,
    activeCartoKey: settings.customCartoApiKey,
  })

  const owmInputId = React.useId()
  const cartoInputId = React.useId()

  const isCartoServerShared = Boolean(
    !hasCustomCarto && CONFIG.keys.cartoApiKey
  )
  const customCount = (hasCustomOwm ? 1 : 0) + (hasCustomCarto ? 1 : 0)

  const onTestOwm = async () => {
    if (settings.customApiKey) {
      recordKey("openweathermap", settings.customApiKey)
    }
    await handleTestOpenWeatherKey()
  }

  const onTestCarto = async () => {
    if (settings.customCartoApiKey) {
      recordKey("carto", settings.customCartoApiKey)
    }
    await handleTestCartoKey()
  }

  return (
    <div className="space-y-4">
      {/* Overview Alert */}
      <Alert
        variant="default"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Dot variant="success" size="lg" pulse />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
                {text.headerTitle}
              </span>
              <Badge variant="primary-outline">{text.credentialsBadge}</Badge>
            </div>
            <div className="mt-0.5 text-tiny text-muted-foreground">
              {text.headerDesc}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-tiny">
          <Badge
            variant="secondary"
            className="font-semibold tracking-wider uppercase"
          >
            {text.customSetCount(customCount, 2)}
          </Badge>
        </div>
      </Alert>

      {/* 1. OpenWeatherMap API Key Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Key className="size-4 text-primary" />
            <label htmlFor={owmInputId}>{text.owmTitle}</label>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {text.owmDesc}
          </CardDescription>
          <CardAction>
            <Badge
              variant={hasCustomOwm ? "primary-light" : "primary-outline"}
              className="font-mono text-xs uppercase"
            >
              {hasCustomOwm ? text.customSet : text.serverShared}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <InputGroup>
            <InputGroupAddon>
              <Key className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id={owmInputId}
              autoComplete="off"
              spellCheck={false}
              type={showOwmKey ? "text" : "password"}
              value={settings.customApiKey || ""}
              onChange={(e) =>
                onUpdateSettings({ customApiKey: e.target.value })
              }
              onBlur={() => {
                if (
                  settings.customApiKey &&
                  settings.customApiKey.length >= 8
                ) {
                  recordKey("openweathermap", settings.customApiKey)
                }
              }}
              placeholder={text.owmPlaceholder}
              className="font-mono text-xs"
            />
            <InputGroupAddon align="inline-end" className="gap-1 pr-1.5">
              {hasCustomOwm && (
                <InputGroupButton
                  size="icon-xs"
                  variant="accent"
                  onClick={() => setShowOwmKey(!showOwmKey)}
                  title={showOwmKey ? text.hideKey : text.showKey}
                  aria-label={showOwmKey ? text.hideOwmKey : text.showOwmKey}
                  aria-pressed={showOwmKey}
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
                variant="success-soft"
                size="xs"
                onClick={onTestOwm}
                disabled={!hasCustomOwm || owmTestStatus === "loading"}
                title={hasCustomOwm ? undefined : text.enterKeyToTest}
                className="gap-1 font-mono text-nano"
              >
                {owmTestStatus === "loading" && (
                  <Spinner className="size-3 text-primary" />
                )}
                <span>{text.testConnection}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>

          {/* Saved Keys using shadcn Item directly below input group (max 3) */}
          {owmHistory.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center gap-1.5 font-mono text-nano tracking-wider text-muted-foreground uppercase">
                <History className="size-3" />
                <span>{text.recentKeys}</span>
                <span className="text-muted-foreground/60">
                  ({Math.min(owmHistory.length, 3)})
                </span>
              </div>
              <ItemGroup className="gap-1.5">
                {owmHistory.slice(0, 3).map((item) => {
                  const isActive =
                    (settings.customApiKey || "").trim() === item.key
                  return (
                    <Item
                      key={item.id}
                      variant="outline"
                      size="xs"
                      className={cn(
                        "flex-nowrap justify-between border-border/70 bg-muted/20 px-2.5 py-1.5",
                        isActive && "border-primary/40 bg-primary/5"
                      )}
                    >
                      <ItemMedia>
                        <Key
                          className={cn(
                            "size-3",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      </ItemMedia>
                      <ItemContent className="min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <code className="font-mono text-tiny font-medium text-foreground">
                            {item.maskedKey}
                          </code>
                          <Badge
                            variant={isActive ? "success-light" : "secondary"}
                            className="font-mono text-nano leading-none uppercase"
                          >
                            {isActive ? text.activeKey : text.previousKey}
                          </Badge>
                          <span className="text-nano text-muted-foreground">
                            • {formatRelativeTime(item.lastUsedAt)}
                          </span>
                        </div>
                      </ItemContent>
                      <ItemActions className="shrink-0">
                        {!isActive ? (
                          <Button
                            type="button"
                            size="xs"
                            onClick={() =>
                              onUpdateSettings({ customApiKey: item.key })
                            }
                            title="Apply this key"
                          >
                            <span>{text.useKey}</span>
                          </Button>
                        ) : (
                          <span className="text-nano font-medium">
                            {text.activeKey}
                          </span>
                        )}
                      </ItemActions>
                    </Item>
                  )
                })}
              </ItemGroup>
            </div>
          )}

          {owmTestMsg && (
            <Alert
              variant={testAlertVariant(owmTestStatus)}
              className="mt-1 text-xs"
              aria-live="polite"
            >
              <AlertTitle className="text-xs font-semibold">
                {testAlertTitle(owmTestStatus, text)}
              </AlertTitle>
              <AlertDescription className="mt-0.5 text-xs">
                {owmTestMsg}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-tiny text-muted-foreground">
            {text.owmHelp}{" "}
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              openweathermap.org
            </a>
          </p>
        </CardContent>
      </Card>

      {/* 2. CARTO Basemaps API Key Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Map className="size-4 text-primary" />
            <label htmlFor={cartoInputId}>{text.cartoTitle}</label>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {text.cartoDesc}
          </CardDescription>
          <CardAction>
            <Badge
              variant={
                hasCustomCarto
                  ? "primary-light"
                  : isCartoServerShared
                    ? "primary-outline"
                    : "outline"
              }
              className="font-mono text-xs uppercase"
            >
              {hasCustomCarto
                ? text.customSet
                : isCartoServerShared
                  ? text.serverShared
                  : "Optional"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <InputGroup>
            <InputGroupAddon>
              <Key className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id={cartoInputId}
              autoComplete="off"
              spellCheck={false}
              type={showCartoKey ? "text" : "password"}
              value={settings.customCartoApiKey || ""}
              onChange={(e) =>
                onUpdateSettings({ customCartoApiKey: e.target.value })
              }
              onBlur={() => {
                if (
                  settings.customCartoApiKey &&
                  settings.customCartoApiKey.length >= 8
                ) {
                  recordKey("carto", settings.customCartoApiKey)
                }
              }}
              placeholder={text.cartoPlaceholder}
              className="font-mono text-xs"
            />
            <InputGroupAddon align="inline-end" className="gap-1 pr-1.5">
              {hasCustomCarto && (
                <InputGroupButton
                  size="icon-xs"
                  variant="accent"
                  onClick={() => setShowCartoKey(!showCartoKey)}
                  title={showCartoKey ? text.hideKey : text.showKey}
                  aria-label={
                    showCartoKey ? text.hideCartoKey : text.showCartoKey
                  }
                  aria-pressed={showCartoKey}
                >
                  {showCartoKey ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </InputGroupButton>
              )}
              <Button
                type="button"
                variant="success-soft"
                size="xs"
                onClick={onTestCarto}
                disabled={!hasCustomCarto || cartoTestStatus === "loading"}
                title={hasCustomCarto ? undefined : text.enterKeyToTest}
                className="gap-1 font-mono text-nano"
              >
                {cartoTestStatus === "loading" && (
                  <Spinner className="size-3 text-primary" />
                )}
                <span>{text.testConnection}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>

          {/* Saved Keys using shadcn Item directly below input group (max 3) */}
          {cartoHistory.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center gap-1.5 font-mono text-nano tracking-wider text-muted-foreground uppercase">
                <History className="size-3" />
                <span>{text.recentKeys}</span>
                <span className="text-muted-foreground/60">
                  ({Math.min(cartoHistory.length, 3)})
                </span>
              </div>
              <ItemGroup className="gap-1.5">
                {cartoHistory.slice(0, 3).map((item) => {
                  const isActive =
                    (settings.customCartoApiKey || "").trim() === item.key
                  return (
                    <Item
                      key={item.id}
                      variant="outline"
                      size="xs"
                      className={cn(
                        "flex-nowrap justify-between border-border/70 bg-muted/20 px-2.5 py-1.5",
                        isActive && "border-primary/40 bg-primary/5"
                      )}
                    >
                      <ItemMedia>
                        <Map
                          className={cn(
                            "size-3",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      </ItemMedia>
                      <ItemContent className="min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <code className="font-mono text-tiny font-medium text-foreground">
                            {item.maskedKey}
                          </code>
                          <Badge
                            variant={isActive ? "success-light" : "secondary"}
                            className="font-mono text-nano uppercase"
                          >
                            {isActive ? text.activeKey : text.previousKey}
                          </Badge>
                          <span className="text-nano text-muted-foreground">
                            • {formatRelativeTime(item.lastUsedAt)}
                          </span>
                        </div>
                      </ItemContent>
                      <ItemActions className="shrink-0">
                        {!isActive ? (
                          <Button
                            type="button"
                            size="xs"
                            onClick={() =>
                              onUpdateSettings({ customCartoApiKey: item.key })
                            }
                            title="Apply this key"
                          >
                            <span>{text.useKey}</span>
                          </Button>
                        ) : (
                          <span className="text-nano font-medium">
                            {text.activeKey}
                          </span>
                        )}
                      </ItemActions>
                    </Item>
                  )
                })}
              </ItemGroup>
            </div>
          )}

          {cartoTestMsg && (
            <Alert
              variant={testAlertVariant(cartoTestStatus)}
              className="mt-1 text-xs"
              aria-live="polite"
            >
              <AlertTitle className="text-xs font-semibold">
                {testAlertTitle(cartoTestStatus, text)}
              </AlertTitle>
              <AlertDescription className="mt-0.5 text-xs">
                {cartoTestMsg}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-tiny text-muted-foreground">
            {text.cartoHelp}{" "}
            <a
              href="https://carto.com/basemaps/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              carto.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
