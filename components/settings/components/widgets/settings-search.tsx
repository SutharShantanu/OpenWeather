"use client"

import * as React from "react"
import { SearchX, CornerDownLeft } from "lucide-react"
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty"

/** One searchable settings section (a card inside a settings page). */
export interface SettingsSearchEntry {
  /** Settings page (tab) that contains the section. */
  tab: string
  /** Card title as rendered; also used to locate the card on the page. */
  title: string
  /** Page label shown as the result's breadcrumb. */
  tabLabel: string
  icon: React.ElementType
  /** Extra match terms (synonyms, unit names) not visible in the title. */
  keywords?: string
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

/**
 * Entries matching every word of `query` (case- and accent-insensitive),
 * ranked: title starts with the query, then title contains it, then others.
 */
export function searchSettings(entries: SettingsSearchEntry[], query: string) {
  const q = normalize(query.trim())
  if (!q) return []
  const words = q.split(/\s+/)
  return entries
    .map((entry) => {
      const title = normalize(entry.title)
      const haystack = `${title} ${normalize(entry.tabLabel)} ${normalize(entry.keywords ?? "")}`
      if (!words.every((w) => haystack.includes(w))) return null
      const rank = title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2
      return { entry, rank }
    })
    .filter(
      (r): r is { entry: SettingsSearchEntry; rank: number } => r !== null
    )
    .sort((a, b) => a.rank - b.rank)
    .map((r) => r.entry)
}

interface SettingsSearchResultsProps {
  results: SettingsSearchEntry[]
  label: string
  emptyLabel: string
  onSelect: (entry: SettingsSearchEntry) => void
}

/** Result list for the settings search; the first result is what Enter opens. */
export function SettingsSearchResults({
  results,
  label,
  emptyLabel,
  onSelect,
}: SettingsSearchResultsProps) {
  if (results.length === 0) {
    return (
      <Empty className="border-0 py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyDescription>{emptyLabel}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ItemGroup aria-label={label} className="gap-1">
      {results.map((entry, index) => {
        const Icon = entry.icon
        return (
          <Item
            key={`${entry.tab}-${entry.title}`}
            asChild
            size="sm"
            variant={index === 0 ? "muted" : "default"}
          >
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="w-full text-start hover:bg-muted"
            >
              <ItemMedia variant="icon">
                <Icon />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="line-clamp-1">{entry.title}</ItemTitle>
                <ItemDescription className="line-clamp-1">
                  {entry.tabLabel}
                </ItemDescription>
              </ItemContent>
              {index === 0 && (
                <ItemActions>
                  <CornerDownLeft
                    aria-hidden
                    className="size-3.5 text-muted-foreground rtl:-scale-x-100"
                  />
                </ItemActions>
              )}
            </button>
          </Item>
        )
      })}
    </ItemGroup>
  )
}
