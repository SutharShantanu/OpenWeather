"use client"

import type React from "react"
import { useEffect, useId, useRef, useState } from "react"
import { Search, MapPin, X, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CONFIG } from "@/lib/config"
import { useTranslation } from "@/components/language-provider"
import { useScrollLock, type useCitySearch } from "@/hooks"

interface HeaderSearchProps {
  /** Search state lives in the header so the brand link can clear it. */
  search: ReturnType<typeof useCitySearch>
  onLocate: () => void
  isLoading?: boolean
}

/** City search with autocomplete. Command provides arrow-key navigation over the results. */
export function HeaderSearch({
  search,
  onLocate,
  isLoading = false,
}: HeaderSearchProps) {
  const { t } = useTranslation()
  const searchFormRef = useRef<HTMLFormElement>(null)
  const listId = useId()
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    clearQuery,
    isCommitted,
    isSearching,
    isLocating,
    inputRef,
    handleSearchFocus,
    handleSelect,
    handleFormSubmit,
    clearSearch,
    recentSearches,
    clearRecentSearches,
    detectedCoords,
  } = search

  // Freeze the page behind the search dropdown while it's open
  useScrollLock(isOpen)

  const trimmedQuery = isCommitted ? "" : query.trim()
  const showPopular = trimmedQuery.length < 2
  const hasSelectableItems = isOpen && (showPopular || results.length > 0)

  // Approximate location from the network (/api/location), fetched the first
  // time the dropdown opens and kept for the session.
  const [approxLocation, setApproxLocation] = useState<{
    city: string
    region?: string
  } | null>(null)
  const approxRequested = useRef(false)
  useEffect(() => {
    if (!isOpen || approxRequested.current) return
    approxRequested.current = true
    fetch("/api/location")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.city)
          setApproxLocation({
            city: data.city,
            region: data.region || data.country,
          })
      })
      .catch(() => {})
  }, [isOpen])

  // Popular places not already shown as recent searches
  const recentKeys = new Set(recentSearches.map((c) => c.toLowerCase()))
  const popularPlaces = CONFIG.location.popularCities
    .filter((c) => !recentKeys.has(c.toLowerCase()))
    .slice(0, 6)

  const handleLocateFromSearch = () => {
    onLocate()
    clearSearch()
  }

  return (
    <Command
      shouldFilter={false}
      loop
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.preventDefault()
          setIsOpen(false)
        } else if (e.key === "Enter" && !hasSelectableItems) {
          // cmdk swallows Enter (preventDefault), which blocks native form submit.
          // With nothing to select, run the free-text search / locate ourselves.
          handleFormSubmit(e)
        }
      }}
      className="size-auto max-w-md min-w-0 flex-1 bg-transparent"
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <form ref={searchFormRef} onSubmit={handleFormSubmit} role="search">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={handleSearchFocus}
                placeholder={t.common.searchPlaceholder}
                aria-label={t.common.searchPlaceholder}
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                className="font-mono text-xs"
              />
              <InputGroupAddon align="inline-end" className="gap-0.5">
                {query && (
                  <InputGroupButton
                    size="icon-xs"
                    variant="warning"
                    onClick={clearQuery}
                    aria-label={t.common.clear}
                  >
                    <X />
                  </InputGroupButton>
                )}
                {/* Idle: shortcut hint. Active (dropdown open): locate action replaces it */}
                {isOpen ? (
                  <InputGroupButton
                    size="icon-xs"
                    variant="outline"
                    className="bg-muted"
                    onClick={onLocate}
                    disabled={isLoading}
                    aria-label={t.common.locateMe}
                  >
                    <MapPin className="size-3" />
                  </InputGroupButton>
                ) : (
                  <Kbd>/</Kbd>
                )}
              </InputGroupAddon>
            </InputGroup>
          </form>
        </PopoverAnchor>

        {/* Autocomplete Dropdown: anchored to the search field, positioned by Radix */}
        <PopoverContent
          align="start"
          // Keep typing focus in the input; clicks on the input itself aren't "outside"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (searchFormRef.current?.contains(e.target as Node))
              e.preventDefault()
          }}
          collisionPadding={12}
          // At least as wide as the field, but roomy on phones where the field is narrow
          className="w-[max(var(--radix-popover-trigger-width),min(22rem,calc(100vw-1.5rem)))] gap-0 p-0"
        >
          <CommandList
            id={listId}
            data-lenis-prevent
            className="h-auto max-h-fit"
          >
            {/* No query yet: locate, recent searches, popular places */}
            {showPopular && (
              <>
                {/* Your location: the network (IP) estimate until GPS is permitted */}
                {(detectedCoords || approxLocation) && (
                  <CommandGroup>
                    <CommandItem
                      value="__my-location__"
                      onSelect={() =>
                        detectedCoords || !approxLocation
                          ? handleLocateFromSearch()
                          : handleSelect(approxLocation.city)
                      }
                      disabled={isLocating || isLoading}
                      className="gap-2.5"
                    >
                      {isLocating ? (
                        <Spinner className="size-4 text-primary" />
                      ) : (
                        <MapPin className="size-4 text-primary" />
                      )}
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-foreground">
                          {approxLocation
                            ? [approxLocation.city, approxLocation.region]
                                .filter(Boolean)
                                .join(", ")
                            : t.common.locateMe}
                        </span>
                        <span className="truncate text-tiny text-muted-foreground">
                          {detectedCoords
                            ? t.header.gpsLocked
                            : t.header.networkLocation}
                        </span>
                      </span>
                    </CommandItem>
                  </CommandGroup>
                )}

                {recentSearches.length > 0 && (
                  <>
                    <CommandSeparator className="mx-0" />
                    <div className="flex items-center justify-between px-2 pt-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t.header.recentSearches}
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={clearRecentSearches}
                        className="text-tiny text-muted-foreground"
                      >
                        {t.common.clear}
                      </Button>
                    </div>
                    <CommandGroup className={CHIP_GROUP}>
                      {recentSearches.map((c) => (
                        <PlaceChip
                          key={c}
                          value={`recent:${c}`}
                          icon={History}
                          onSelect={() => handleSelect(c)}
                        >
                          {c}
                        </PlaceChip>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {popularPlaces.length > 0 && (
                  <>
                    <CommandSeparator className="mx-0" />
                    <CommandGroup
                      heading={t.header.popularHubs}
                      className={CHIP_GROUP}
                    >
                      {popularPlaces.map((c) => (
                        <PlaceChip
                          key={c}
                          value={`popular:${c}`}
                          icon={MapPin}
                          onSelect={() => handleSelect(c)}
                        >
                          {c}
                        </PlaceChip>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </>
            )}

            {!showPopular && results.length > 0 && (
              <CommandGroup
                heading={t.header.geocodingMatches}
                className="h-auto"
              >
                {results.map((r, i) => (
                  <CommandItem
                    key={`${r.name}-${r.lat}-${r.lon}-${i}`}
                    value={`result:${r.name}:${r.lat}:${r.lon}:${i}`}
                    onSelect={() => handleSelect(r.name)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <MapPin className="size-3 text-primary" />
                      <span className="truncate font-medium text-foreground">
                        {r.name}
                      </span>
                      <span className="truncate text-mini text-muted-foreground">
                        {r.state ? `${r.state}, ` : ""}
                        {r.country}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!showPopular && results.length === 0 && (
              <CommandEmpty className="flex items-center justify-center gap-2 py-4 font-mono text-muted-foreground">
                {isSearching ? (
                  <>
                    <Spinner className="size-3.5" />
                    {t.header.locatingStations}
                  </>
                ) : (
                  t.header.noStationFound(trimmedQuery)
                )}
              </CommandEmpty>
            )}
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  )
}

/** Lays out a cmdk group's items as wrapping chips. */
const CHIP_GROUP =
  "flex flex-col [&_[cmdk-group-items]]:p-2 [&_[cmdk-group-items]]:pt-0 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-wrap [&_[cmdk-group-items]]:gap-1.5"

/** A place shown as a rounded badge; still a cmdk item, so arrow keys reach it. */
function PlaceChip({
  value,
  icon: Icon,
  onSelect,
  children,
}: {
  value: string
  icon: React.ElementType
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    // `[&>svg]:hidden` drops CommandItem's invisible trailing check icon,
    // which otherwise reserves 24px after the badge.
    <CommandItem
      value={value}
      onSelect={onSelect}
      className="m-0 w-fit p-0 [&>svg]:hidden"
    >
      <Badge variant="invert-light">
        <Icon />
        {children}
      </Badge>
    </CommandItem>
  )
}
