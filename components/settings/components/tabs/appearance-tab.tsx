"use client"

import * as React from "react"
import {
  SunMoon,
  Bot,
  ArrowDownRight,
  ArrowDownLeft,
  EyeOff,
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTile } from "@/components/ui/icon-tile"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMounted } from "@/hooks/use-mount"
import { useTranslation } from "@/components/language-provider"
import { THEME_OPTIONS, DEFAULT_THEME_ID } from "../../constants"
import { SelectionCheckIndicator } from "../widgets/selection-check-indicator"
import type { AiButtonPosition, TabBaseProps } from "../../types"

const AI_BUTTON_POSITIONS = [
  { id: "bottom-right", icon: ArrowDownRight },
  { id: "bottom-left", icon: ArrowDownLeft },
  { id: "hidden", icon: EyeOff },
] as const satisfies readonly {
  id: AiButtonPosition
  icon: React.ElementType
}[]

const POSITION_LABEL_KEY = {
  "bottom-right": "bottomRight",
  "bottom-left": "bottomLeft",
  hidden: "hidden",
} as const

export function AppearanceTabContent({
  settings,
  onUpdateSettings,
}: Pick<TabBaseProps, "settings" | "onUpdateSettings">) {
  const { t } = useTranslation()
  const themeText = t.settingsDialog.theme
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const activeThemeId = mounted ? theme : DEFAULT_THEME_ID
  const activeThemeOption =
    THEME_OPTIONS.find((option) => option.id === activeThemeId) ??
    THEME_OPTIONS.find((option) => option.id === DEFAULT_THEME_ID)!

  const assistant = t.settingsDialog.assistant
  const aiPosition = settings.aiButtonPosition ?? "bottom-right"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <SunMoon className="size-4 text-primary" />
            <span>{themeText.headerTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {themeText.headerSubtitle}
          </CardDescription>
          <CardAction>
            <Badge
              variant="primary-outline"
              className="font-mono text-xs uppercase"
            >
              {themeText[`${activeThemeOption.id}Title`]}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            orientation="horizontal"
            value={activeThemeId}
            onValueChange={(val) => {
              if (val) setTheme(val)
            }}
            spacing={0}
          >
            {THEME_OPTIONS.map((item) => {
              const isSelected = mounted && theme === item.id
              const Icon = item.icon
              return (
                <ToggleGroupItem
                  key={item.id}
                  value={item.id}
                  className="h-auto w-1/3 flex-col py-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                >
                  {/* Card Info */}
                  <span className="block w-full">
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <IconTile
                          size="sm"
                          variant={isSelected ? "soft" : "outline"}
                        >
                          <Icon />
                        </IconTile>
                        <span className="block min-w-0 flex-1">
                          <span className="block truncate font-heading text-xs font-semibold text-foreground">
                            {themeText[`${item.id}Title`]}
                          </span>
                          <span className="block truncate font-mono text-tiny text-muted-foreground">
                            {themeText[`${item.id}Subtitle`]}
                          </span>
                        </span>
                      </span>
                      <SelectionCheckIndicator isSelected={isSelected} />
                    </span>

                    <span className="mt-2 line-clamp-3 block text-tiny leading-relaxed text-muted-foreground text-truncate">
                      {themeText[`${item.id}Desc`]}
                    </span>
                  </span>

                  {/* Footer Profile Badge */}
                  <span className="mt-2.5 flex w-full items-center justify-between font-mono text-tiny">
                    <Badge
                      variant={isSelected ? "primary-light" : "outline"}
                      className="truncate font-mono text-tiny tracking-wider uppercase"
                    >
                      {themeText[`${item.id}Badge`]}
                    </Badge>
                  </span>
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Floating AI advisor button placement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Bot className="size-4 text-primary" />
            <span>{assistant.title}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {assistant.desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={aiPosition}
            onValueChange={(val) => {
              if (val)
                onUpdateSettings({ aiButtonPosition: val as AiButtonPosition })
            }}
            aria-label={assistant.title}
          >
            {AI_BUTTON_POSITIONS.map(({ id, icon: Icon }) => (
              <ToggleGroupItem
                key={id}
                value={id}
                className="h-auto w-1/3 flex-col py-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary/5"
              >
                <Icon className="size-4" />
                <span className="truncate">
                  {assistant[POSITION_LABEL_KEY[id]]}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>
    </div>
  )
}
