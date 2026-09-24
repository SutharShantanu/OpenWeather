"use client"

import * as React from "react"
import { SunMoon } from "lucide-react"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMounted } from "@/hooks/use-mount"
import { useTranslation } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import { THEME_OPTIONS, DEFAULT_THEME_ID } from "../../constants"
import { SelectionCheckIndicator } from "../widgets/selection-check-indicator"

export function AppearanceTabContent() {
  const { t } = useTranslation()
  const themeText = t.settingsDialog.theme
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const activeThemeId = mounted ? theme : DEFAULT_THEME_ID
  const activeThemeOption =
    THEME_OPTIONS.find((option) => option.id === activeThemeId) ??
    THEME_OPTIONS.find((option) => option.id === DEFAULT_THEME_ID)!

  return (
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
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full"
          value={activeThemeId}
          onValueChange={(val) => {
            if (val) setTheme(val)
          }}
          spacing={2}
        >
          {THEME_OPTIONS.map((item) => {
            const isSelected = mounted && theme === item.id
            const Icon = item.icon
            return (
              <ToggleGroupItem
                key={item.id}
                value={item.id}
                className={cn(
                  "group relative flex h-auto min-h-24 w-full min-w-0 cursor-pointer flex-col justify-between p-3.5 text-left whitespace-normal border border-border transition-all hover:border-primary/50 hover:bg-muted/30",
                  isSelected &&
                    "data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                )}
              >
                {/* Card Info */}
                <span className="block w-full">
                  <span className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center border transition-colors",
                          isSelected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
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

                  <span className="mt-2 block line-clamp-3 text-tiny leading-relaxed text-muted-foreground">
                    {themeText[`${item.id}Desc`]}
                  </span>
                </span>

                {/* Footer Profile Badge */}
                <span className="mt-2.5 flex w-full items-center justify-between font-mono text-tiny">
                  <Badge
                    variant={isSelected ? "primary-light" : "outline"}
                    className="font-mono text-tiny tracking-wider uppercase truncate"
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
  )
}
