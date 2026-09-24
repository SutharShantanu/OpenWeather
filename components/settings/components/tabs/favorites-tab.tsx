"use client"

import React, { useId } from "react"
import {
  MapPin,
  Globe,
  Plus,
  Trash2,
  Radio,
  Navigation,
  Star,
  Search,
  X,
  Check,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Dot } from "@/components/ui/dot"
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
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemSeparator,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { CONFIG } from "@/lib/config"
import {
  MAX_PINNED_CITIES,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/lib/constants"
import type { LocationsTabProps } from "../../types"
import { useNearbyCities } from "@/hooks"
import { useTranslation } from "@/components/language-provider"
import { useFavoritesTab } from "../../hooks"

export function FavoritesTabContent({
  pinnedCities,
  onAddPinnedCity,
  onRemovePinnedCity,
  onSelectCity,
  onCloseDialog,
  coords,
  city,
}: LocationsTabProps) {
  const { t } = useTranslation()
  const text = t.settingsDialog.locations
  const {
    nearbyCities,
    nearbyLoading,
    nearbyCurrentCity,
    nearbyError,
    hasCoords,
    retryNearby,
  } = useNearbyCities({ coords })
  const listboxId = useId()
  const optionId = (i: number) => `${listboxId}-option-${i}`

  const {
    newCityInput,
    setNewCityInput,
    clearSearch,
    searchResults,
    isSearching,
    isSearchOpen,
    setIsSearchOpen,
    activeIndex,
    setActiveIndex,
    searchFeedback,
    searchContainerRef,
    suggestionTab,
    setSuggestionTab,
    selectingCity,
    isMaxPinned,
    isPinned,
    handleAddCity,
    handleSearchKeyDown,
    handleSelectSearchResult,
    handleSelectStation,
    handleRemoveStation,
    filteredNearbyCities,
    filteredPopularCities,
  } = useFavoritesTab({
    pinnedCities,
    onAddPinnedCity,
    onRemovePinnedCity,
    onSelectCity,
    onCloseDialog,
    nearbyCities,
  })

  const isDropdownOpen =
    isSearchOpen && newCityInput.trim().length >= SEARCH_MIN_QUERY_LENGTH

  /** Shared a11y/interaction props for clickable "pin" badges. */
  const pinButtonProps = (name: string, label: string) => ({
    role: "button" as const,
    "aria-label": label,
    "aria-disabled": isMaxPinned || undefined,
    tabIndex: isMaxPinned ? -1 : 0,
    onClick: () => {
      if (!isMaxPinned) onAddPinnedCity(name)
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (!isMaxPinned) onAddPinnedCity(name)
      }
    },
  })

  return (
    <div className="space-y-4">
      {/* Active Station Telemetry Banner */}
      <Alert
        variant="default"
        className="flex flex-wrap items-center justify-between gap-3 border-border bg-card p-3.5 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <Dot variant="success" size="lg" pulse />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
                {text.activeStation}
              </span>
              <Badge variant="success-outline">{text.liveSync}</Badge>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {text.monitoringLabel}{" "}
              <strong className="text-foreground font-semibold">
                {city || CONFIG.location.defaultCity}
              </strong>
              {coords && (
                <span className="font-mono ml-1 text-muted-foreground/80">
                  ({coords.lat.toFixed(2)}°, {coords.lon.toFixed(2)}°)
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <Badge
            variant={isMaxPinned ? "warning-outline" : "primary-outline"}
            className="font-mono text-xs uppercase"
          >
            {text.savedCount(pinnedCities.length, MAX_PINNED_CITIES)}
          </Badge>
        </div>
      </Alert>

      {/* Add Station Card with Autocomplete Search & Tabbed Discovery */}
      <Card className="overflow-visible relative z-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Plus className="size-4 text-primary" />
            <span>{text.addTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {text.addDesc}
          </CardDescription>
          <CardAction>
            <Badge
              variant={isMaxPinned ? "warning-outline" : "primary-outline"}
              className="font-mono text-xs uppercase"
            >
              {isMaxPinned
                ? text.limitCount(pinnedCities.length, MAX_PINNED_CITIES)
                : text.pinnedCount(pinnedCities.length, MAX_PINNED_CITIES)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search Input with Integrated Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative z-30">
            <form onSubmit={handleAddCity}>
              <InputGroup>
                <InputGroupAddon>
                  <Search className="size-3.5 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  value={newCityInput}
                  disabled={isMaxPinned}
                  role="combobox"
                  aria-label={text.searchAria}
                  aria-autocomplete="list"
                  aria-expanded={isDropdownOpen}
                  aria-controls={isDropdownOpen ? listboxId : undefined}
                  aria-activedescendant={
                    isDropdownOpen && activeIndex >= 0 && activeIndex < searchResults.length
                      ? optionId(activeIndex)
                      : undefined
                  }
                  autoComplete="off"
                  onChange={(e) => setNewCityInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => {
                    if (newCityInput.trim().length >= SEARCH_MIN_QUERY_LENGTH) {
                      setIsSearchOpen(true)
                    }
                  }}
                  placeholder={
                    isMaxPinned
                      ? text.maxPinnedPlaceholder(MAX_PINNED_CITIES)
                      : text.searchPlaceholder
                  }
                  className="font-sans text-xs"
                />
                {(isSearching || newCityInput) && (
                  <InputGroupAddon align="inline-end" className="pr-1.5 gap-1">
                    {isSearching && (
                      <Spinner className="size-3 text-primary" />
                    )}
                    {newCityInput && (
                      <InputGroupButton
                        type="button"
                        size="icon-sm"
                        variant="destructive"
                        onClick={clearSearch}
                        title={t.common.clear}
                        aria-label={text.clearSearch}
                      >
                        <X className="size-3" />
                      </InputGroupButton>
                    )}
                  </InputGroupAddon>
                )}
              </InputGroup>
            </form>

            {/* Live Autocomplete Search Results Dropdown */}
            {isDropdownOpen && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 text-xs gap-0 pb-0">
                <CardHeader className="flex flex-row items-center justify-between font-mono text-tiny text-muted-foreground uppercase sticky top-0 z-10">
                  <CardTitle className="font-mono text-tiny font-normal text-muted-foreground uppercase">
                    {text.resultsTitle}
                  </CardTitle>
                  <CardAction className="self-center font-mono text-tiny">
                    {isSearching ? (
                      <span className="flex items-center gap-1 text-primary">
                        <Spinner className="size-2.5" />
                        {text.searching}
                      </span>
                    ) : (
                      <span>{text.foundCount(searchResults.length)}</span>
                    )}
                  </CardAction>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="max-h-56">
                    {isSearching && searchResults.length === 0 ? (
                      <EmptyState
                        variant="ghost"
                        size="sm"
                        icon={<Spinner className="size-3.5 text-primary" />}
                        withIconStack={false}
                        title={text.locatingStations}
                        className="py-4"
                      />
                    ) : searchResults.length > 0 ? (
                      <ItemGroup
                        id={listboxId}
                        role="listbox"
                        aria-label={text.resultsAria}
                        className="gap-0"
                      >
                        {searchResults.map((r, i) => {
                          const isAlreadyPinned = isPinned(r.name)
                          const isSelectDisabled = isAlreadyPinned || isMaxPinned
                          const isActive = i === activeIndex
                          return (
                            <React.Fragment key={`${r.name}-${r.lat}-${r.lon}-${i}`}>
                              <Item
                                id={optionId(i)}
                                role="option"
                                aria-selected={isActive}
                                aria-disabled={isSelectDisabled || undefined}
                                // Options are navigated via the combobox input (aria-activedescendant)
                                tabIndex={-1}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setActiveIndex(i)}
                                onClick={() => {
                                  if (!isSelectDisabled) {
                                    handleSelectSearchResult(r)
                                  }
                                }}
                                className={cn(
                                  "justify-between transition-colors",
                                  isActive && "bg-muted",
                                  isSelectDisabled
                                    ? "cursor-default"
                                    : "cursor-pointer"
                                )}
                              >
                                <ItemMedia variant="icon">
                                  <MapPin className="size-3.5 shrink-0 text-primary" />
                                </ItemMedia>

                                <ItemContent className="min-w-0 flex-row items-center gap-1.5">
                                  <ItemTitle className="font-heading font-medium text-foreground truncate">
                                    {r.name}
                                  </ItemTitle>
                                  <span className="font-mono text-mini text-muted-foreground truncate">
                                    {r.state && `${r.state}`}
                                    {r.country && `, ${r.country}`}
                                  </span>
                                </ItemContent>

                                <ItemActions className="gap-2 shrink-0">
                                  <span className="font-mono text-tiny text-muted-foreground hidden sm:inline-block">
                                    {r.lat.toFixed(2)}°, {r.lon.toFixed(2)}°
                                  </span>
                                  {isAlreadyPinned ? (
                                    <Badge
                                      variant="success-light"
                                      className="font-mono text-tiny gap-1"
                                    >
                                      <Check className="size-2.5" />
                                      {text.pinned}
                                    </Badge>
                                  ) : isMaxPinned ? (
                                    <Badge
                                      variant="destructive-light"
                                      className="font-mono text-tiny"
                                    >
                                      {text.limitBadge(MAX_PINNED_CITIES)}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="primary-light"
                                      className="font-mono text-tiny gap-1 text-primary"
                                    >
                                      <Plus className="size-2.5" />
                                      {text.pin}
                                    </Badge>
                                  )}
                                </ItemActions>
                              </Item>
                              {i < searchResults.length - 1 && (
                                <ItemSeparator className="my-0" aria-hidden="true" />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </ItemGroup>
                    ) : (
                      <EmptyState
                        variant="ghost"
                        size="sm"
                        icon={Search}
                        withIconStack={false}
                        title={text.noStationTitle}
                        description={text.noStationDesc(newCityInput.trim())}
                        className="py-3"
                      />
                    )}
                  </ScrollArea>
                </CardContent>
                {searchFeedback && (
                  <div
                    role="status"
                    className="border-t border-border px-3 py-2 font-mono text-tiny text-warning"
                  >
                    {searchFeedback === "noMatch"
                      ? text.feedbackNoMatch
                      : text.feedbackAllPinned}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Tab-based discovery: Nearby Stations & Popular Global Hubs */}
          <Tabs
            value={suggestionTab}
            onValueChange={setSuggestionTab}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger
                  value="nearby"
                  className="font-mono text-tiny gap-1.5"
                >
                  <Navigation className="size-3" />
                  <span>{text.nearbyTab}</span>
                  {coords && filteredNearbyCities.length > 0 && (
                    <Badge
                      variant="primary-light"
                      size="xs"
                      className="font-mono text-nano font-semibold"
                    >
                      {filteredNearbyCities.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="popular"
                  className="font-mono text-tiny gap-1.5"
                >
                  <Globe className="size-3" />
                  <span>{text.popularTab}</span>
                  {filteredPopularCities.length > 0 && (
                    <Badge
                      variant="secondary"
                      size="xs"
                      className="font-mono text-nano text-muted-foreground"
                    >
                      {filteredPopularCities.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {suggestionTab === "nearby" && nearbyCurrentCity && (
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-micro text-muted-foreground">
                  <MapPin className="size-2.5 text-primary" />
                  {text.near(nearbyCurrentCity)}
                </span>
              )}
            </div>

            {/* Tab 1: Nearby Stations */}
            <TabsContent value="nearby">
              {nearbyLoading ? (
                <div className="flex items-center gap-2 py-1.5 font-mono text-tiny text-muted-foreground">
                  <Spinner className="size-3 text-primary" />
                  <span>{text.scanningNearby}</span>
                </div>
              ) : filteredNearbyCities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {filteredNearbyCities.slice(0, 8).map((targetCity) => (
                    <Badge
                      key={`${targetCity.name}-${targetCity.country}`}
                      variant="outline"
                      {...pinButtonProps(targetCity.name, text.pinNearbyAria(targetCity.name, targetCity.distance))}
                      className={cn(
                        "gap-1 text-xs text-foreground transition-colors select-none",
                        isMaxPinned
                          ? "cursor-not-allowed opacity-40 border-border/40"
                          : "cursor-pointer hover:bg-muted"
                      )}
                    >
                      <Plus className="size-2.5 text-primary" />
                      <span>{targetCity.name}</span>
                      <span className="font-mono text-muted-foreground/70">
                        {targetCity.distance}km
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : nearbyError ? (
                <EmptyState
                  variant="ghost"
                  size="sm"
                  icon={Navigation}
                  withIconStack={false}
                  title={text.nearbyErrorTitle}
                  description={text.nearbyErrorDesc}
                  className="py-3"
                >
                  <Button variant="outline" size="sm" onClick={retryNearby}>
                    {text.retry}
                  </Button>
                </EmptyState>
              ) : !hasCoords ? (
                <EmptyState
                  variant="ghost"
                  size="sm"
                  icon={Navigation}
                  withIconStack={false}
                  title={text.locationUnknownTitle}
                  description={text.locationUnknownDesc}
                  className="py-3"
                />
              ) : nearbyCities.length > 0 ? (
                <EmptyState
                  variant="ghost"
                  size="sm"
                  icon={Check}
                  withIconStack={false}
                  title={text.allNearbySavedTitle}
                  description={text.allNearbySavedDesc}
                  className="py-3"
                />
              ) : (
                <EmptyState
                  variant="ghost"
                  size="sm"
                  icon={Navigation}
                  withIconStack={false}
                  title={text.noRegionalTitle}
                  description={text.noRegionalDesc}
                  className="py-3"
                />
              )}
            </TabsContent>

            {/* Tab 2: Popular Global Stations */}
            <TabsContent value="popular">
              {filteredPopularCities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {filteredPopularCities.map((popularCity) => (
                    <Badge
                      key={popularCity}
                      variant="outline"
                      size="default"
                      {...pinButtonProps(popularCity, text.pinAria(popularCity))}
                      className={cn(
                        "gap-1 border-border font-normal text-tiny text-foreground transition-colors select-none",
                        isMaxPinned
                          ? "cursor-not-allowed opacity-40 bg-muted/20"
                          : "cursor-pointer bg-muted/40 hover:bg-muted"
                      )}
                    >
                      <Plus className="size-2.5 text-muted-foreground" />
                      <span>{popularCity}</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <EmptyState
                  variant="ghost"
                  size="sm"
                  icon={Check}
                  withIconStack={false}
                  title={text.allPopularAddedTitle}
                  description={text.allPopularAddedDesc}
                  className="py-3"
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* List of Pinned Cities */}
      {pinnedCities.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={text.noPinnedTitle}
          description={text.noPinnedDesc}
        />
      ) : (
        <Card className="pb-0 relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Star className="size-4 text-chart-5" />
              <span>{text.savedTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {text.savedDesc(pinnedCities.length, MAX_PINNED_CITIES)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ItemGroup className="gap-0!">
              {pinnedCities.map((cityName, index) => (
                <React.Fragment key={cityName}>
                  <Item
                    size="sm"
                    className="group justify-between transition-colors hover:bg-primary/10"
                  >
                    <ItemMedia variant="icon">
                      <div className="flex size-7 shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
                        <MapPin className="size-3.5" />
                      </div>
                    </ItemMedia>

                    <ItemContent className="min-w-0">
                      <ItemTitle className="font-heading text-xs font-semibold text-foreground truncate">
                        {cityName}
                      </ItemTitle>
                      <ItemDescription className="font-mono text-tiny text-muted-foreground">
                        {text.groundStation}
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions className="gap-1.5 shrink-0">
                      <Button
                        variant="accent"
                        size="icon-sm"
                        title={text.selectStation}
                        aria-label={text.showWeatherFor(cityName)}
                        disabled={selectingCity !== null}
                        onClick={() => handleSelectStation(cityName)}
                        className="gap-1 font-mono text-xs"
                      >
                        {selectingCity === cityName ? (
                          <Spinner className="size-4 text-primary" />
                        ) : (
                          <Radio className="size-4 text-primary" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        disabled={selectingCity === cityName}
                        onClick={() => handleRemoveStation(cityName)}
                        className="gap-1 font-mono text-xs"
                        title={text.removeFromFavorites}
                        aria-label={text.removeAria(cityName)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </ItemActions>
                  </Item>
                  {index < pinnedCities.length - 1 && (
                    <ItemSeparator className="my-0" />
                  )}
                </React.Fragment>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const LocationsTabContent = FavoritesTabContent
