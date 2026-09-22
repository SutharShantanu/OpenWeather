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
import { THEME_OPTIONS, DEFAULT_THEME_ID } from "./constants"
import { SelectionCheckIndicator } from "./shared-widgets"

export function AppearanceTabContent() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
          <SunMoon className="size-4 text-primary" />
          <span>{t.settingsDialog.theme.headerTitle}</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {t.settingsDialog.theme.headerSubtitle}
        </CardDescription>
        <CardAction>
          <Badge
            variant="primary-outline"
            className="font-mono text-xs uppercase"
          >
            {mounted ? theme : DEFAULT_THEME_ID}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          type="single"
          orientation="horizontal"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full"
          value={mounted ? theme : DEFAULT_THEME_ID}
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
                <div className="w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center border transition-colors",
                          isSelected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-heading text-xs font-semibold text-foreground truncate">
                          {item.title}
                        </div>
                        <div className="font-mono text-tiny text-muted-foreground truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <SelectionCheckIndicator isSelected={isSelected} />
                  </div>

                  <p className="mt-2 line-clamp-3 text-tiny leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>

                {/* Footer Profile Badge */}
                <div className="mt-2.5 flex w-full items-center justify-between font-mono text-tiny">
                  <Badge
                    variant={isSelected ? "primary-light" : "outline"}
                    className="font-mono text-tiny tracking-wider uppercase truncate"
                  >
                    {item.badge}
                  </Badge>
                </div>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </CardContent>
    </Card>
  )
}
