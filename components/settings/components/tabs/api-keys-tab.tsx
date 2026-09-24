"use client"

import React from "react"
import { Key, Eye, EyeOff } from "lucide-react"
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
import { useTranslation } from "@/components/language-provider"
import type { Translations } from "@/lib/translations"
import type { TabBaseProps } from "../../types"
import { useApiKeyValidation } from "../../hooks"
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
  } = useApiKeyValidation({
    customApiKey: settings.customApiKey,
    city,
  })
  const owmInputId = React.useId()

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
            {text.customSetCount(hasCustomOwm ? 1 : 0, 1)}
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
                onClick={handleTestOpenWeatherKey}
                disabled={!hasCustomOwm || owmTestStatus === "loading"}
                title={hasCustomOwm ? undefined : text.enterKeyToTest}
                className="font-mono text-nano gap-1"
              >
                {owmTestStatus === "loading" && (
                  <Spinner className="size-3 text-primary" />
                )}
                <span>{text.testConnection}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>

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
    </div>
  )
}
