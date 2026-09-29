"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { Compass, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { IconTile } from "@/components/ui/icon-tile"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useTranslation } from "@/components/language-provider"
import { THEME_OPTIONS } from "@/components/settings/constants"

export interface HeaderMenuItem {
  id: string
  label: string
  description: string
  icon: React.ElementType
  onSelect: () => void
  disabled?: boolean
}

interface HeaderMobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: HeaderMenuItem[]
  /** Theme is only known after hydration. */
  mounted: boolean
}

/** Drawer with the secondary header actions and theme picker, below the lg breakpoint. */
export function HeaderMobileMenu({
  open,
  onOpenChange,
  items,
  mounted,
}: HeaderMobileMenuProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  /** Closes the menu before running an action, so dialogs don't stack under it. */
  const runFromMenu = (action?: () => void) => () => {
    onOpenChange(false)
    action?.()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        aria-describedby={undefined}
        className="lg:hidden"
      >
        <DrawerHeader className="border-b border-border pe-12">
          <DrawerTitle className="flex items-center gap-2">
            <IconTile variant="solid" size="xs">
              <Compass />
            </IconTile>
            OpenWeather
          </DrawerTitle>
        </DrawerHeader>

        <ItemGroup
          aria-label={t.header.mainMenu}
          className="flex-1 gap-1.5 overflow-y-auto p-3"
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Item key={item.id} asChild variant="outline" size="sm">
                <Button
                  variant="ghost"
                  disabled={item.disabled}
                  onClick={runFromMenu(item.onSelect)}
                  className="h-auto flex-nowrap justify-start text-start whitespace-normal"
                >
                  <ItemMedia>
                    <IconTile variant="soft" size="sm">
                      <Icon />
                    </IconTile>
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="font-heading">{item.label}</ItemTitle>
                    <ItemDescription className="truncate">
                      {item.description}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
                  </ItemActions>
                </Button>
              </Item>
            )
          })}
        </ItemGroup>

        <Separator />

        <DrawerFooter className="gap-2 p-3">
          <ItemTitle className="font-mono text-tiny text-muted-foreground uppercase">
            {t.settingsDialog.theme.headerTitle}
          </ItemTitle>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={1}
            value={mounted ? theme : undefined}
            onValueChange={(value) => {
              if (value) setTheme(value)
            }}
            disabled={!mounted}
            aria-label={t.settingsDialog.theme.headerTitle}
            className="grid w-full grid-cols-3"
          >
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              const label = t.settingsDialog.theme[`${option.id}Title`]
              return (
                <ToggleGroupItem
                  key={option.id}
                  value={option.id}
                  aria-label={label}
                  className="h-auto flex-col text-tiny"
                >
                  <Icon className="size-4" />
                  <span className="truncate">{label}</span>
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
