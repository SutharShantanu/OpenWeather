"use client"

import { useId, useRef } from "react"
import { Search, MapPin, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { IconTile } from "@/components/ui/icon-tile"
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
import { cn } from "@/lib/utils"
import { CONFIG } from "@/lib/config"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"
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
  const prefs = useDisplayPreferences()
  const searchFormRef = useRef<HTMLFormElement>(null)
  const listId = useId()
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    clearResults,
    isSearching,
    detectedCoords,
    isLocating,
    inputRef,
    handleSearchFocus,
    handleSelect,
    handleFormSubmit,
    clearSearch,
  } = search

  // Freeze the page behind the search dropdown while it's open
  useScrollLock(isOpen)

  const trimmedQuery = query.trim()
  const showPopular = trimmedQuery.length < 2
  const hasSelectableItems = isOpen && (showPopular || results.length > 0)

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
                    onClick={() => {
                      setQuery("")
                      clearResults()
                    }}
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
          className="w-(--radix-popover-trigger-width) gap-0 p-0"
        >
          <CommandList
            id={listId}
            data-lenis-prevent
            className="h-auto max-h-fit"
          >
            {/* GPS current station: offered while the user hasn't typed a query */}
            {showPopular && (
              <>
                <CommandGroup>
                  <CommandItem
                    value="__locate__"
                    onSelect={handleLocateFromSearch}
                    className="gap-2.5 bg-accent font-mono"
                  >
                    <IconTile variant="soft" size="xs">
                      <MapPin className={cn(isLocating && "animate-pulse")} />
                    </IconTile>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        {t.header.currentStationGps}
                        {isLocating ? (
                          <Badge
                            variant="outline"
                            className="animate-pulse border-primary/30 font-mono text-tiny text-primary"
                          >
                            {t.header.detecting}
                          </Badge>
                        ) : detectedCoords ? (
                          <Badge
                            variant="success-light"
                            className="font-mono text-tiny"
                          >
                            {t.header.gpsLocked}
                          </Badge>
                        ) : null}
                      </span>
                      <span className="truncate text-mini text-muted-foreground">
                        {detectedCoords
                          ? `${prefs.coords(detectedCoords.lat, detectedCoords.lon, 3)} • ${t.header.clickToLoadStation}`
                          : t.header.autoDetectStation}
                      </span>
                    </span>
                    <Button
                      size="xs"
                      variant="default"
                      disabled={isLocating || isLoading}
                      className="shrink-0 gap-1 font-mono text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLocateFromSearch()
                      }}
                    >
                      {isLocating ? (
                        <>
                          <Spinner className="size-3" />
                          <span>{t.common.locating}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="size-3" />
                          <span>{t.header.locateAction}</span>
                          <ArrowRight className="size-3 rtl:rotate-180" />
                        </>
                      )}
                    </Button>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator className="mx-0" />
                <CommandGroup heading={t.header.popularHubs}>
                  {CONFIG.location.popularCities.slice(0, 8).map((c) => (
                    <CommandItem
                      key={c}
                      value={`popular:${c}`}
                      onSelect={() => handleSelect(c)}
                      className="font-mono"
                    >
                      <MapPin className="size-3 text-primary" />
                      {c}
                    </CommandItem>
                  ))}
                </CommandGroup>
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
                    className="justify-between"
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
                    <span className="shrink-0 font-mono text-tiny text-muted-foreground">
                      {prefs.coords(r.lat, r.lon, 2)}
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
