"use client"

import React, { useState, useEffect, useRef } from "react"
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
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/lib/constants"
import { LocationsTabProps, GeocodingResult, NearbyCity } from "./types"
import { POPULAR_CITIES } from "./constants"

export function FavoritesTabContent({
  pinnedCities,
  onAddPinnedCity,
  onRemovePinnedCity,
  onSelectCity,
  onCloseDialog,
  coords,
  city,
}: LocationsTabProps) {
  const [newCityInput, setNewCityInput] = useState("")
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [nearbyCities, setNearbyCities] = useState<NearbyCity[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyCurrentCity, setNearbyCurrentCity] = useState("")
  const [suggestionTab, setSuggestionTab] = useState<string>("nearby")
  const [selectingCity, setSelectingCity] = useState<string | null>(null)
  const [removingCity, setRemovingCity] = useState<string | null>(null)

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Live search debounced API lookup via /api/search
  useEffect(() => {
    const q = newCityInput.trim()
    if (q.length < SEARCH_MIN_QUERY_LENGTH) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = await res.json()
          const list: GeocodingResult[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : []
          setSearchResults(list)
        }
      } catch (err) {
        console.warn("Geocoding lookup error:", err)
      } finally {
        setIsSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [newCityInput])

  // Fetch nearby cities based on user's coordinates
  useEffect(() => {
    if (!coords) return
    let cancelled = false
    setNearbyLoading(true)
    fetch(`/api/nearby?lat=${coords.lat}&lon=${coords.lon}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setNearbyCities(data.cities || [])
        setNearbyCurrentCity(data.currentCity || "")
      })
      .catch(() => {
        if (!cancelled) setNearbyCities([])
      })
      .finally(() => {
        if (!cancelled) setNearbyLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [coords])

  const isMaxPinned = pinnedCities.length >= MAX_PINNED_CITIES

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault()
    if (isMaxPinned) return
    if (searchResults.length > 0) {
      const firstUnpinned = searchResults.find(
        (r) =>
          !pinnedCities.some(
            (c) => c.toLowerCase() === r.name.toLowerCase()
          )
      )
      if (firstUnpinned) {
        onAddPinnedCity(firstUnpinned.name)
      }
    } else if (newCityInput.trim()) {
      onAddPinnedCity(newCityInput.trim())
      setNewCityInput("")
      setSearchResults([])
      setIsSearchOpen(false)
    }
  }

  const handleSelectSearchResult = (targetCity: GeocodingResult) => {
    if (isMaxPinned) return
    onAddPinnedCity(targetCity.name)
  }

  const handleSelectStation = async (cityName: string) => {
    setSelectingCity(cityName)
    try {
      await onSelectCity(cityName)
      setTimeout(() => {
        onCloseDialog()
        setSelectingCity(null)
      }, 300)
    } catch {
      setSelectingCity(null)
    }
  }

  const handleRemoveStation = async (cityName: string) => {
    setRemovingCity(cityName)
    try {
      await onRemovePinnedCity(cityName)
    } finally {
      setRemovingCity(null)
    }
  }

  // Filter nearby cities that aren't already pinned
  const filteredNearbyCities = nearbyCities.filter(
    (c) => !pinnedCities.includes(c.name)
  )

  // Filter popular cities: exclude pinned and nearby
  const nearbyNames = new Set(nearbyCities.map((c) => c.name.toLowerCase()))
  const filteredPopularCities = POPULAR_CITIES.filter(
    (c) =>
      !pinnedCities.includes(c) && !nearbyNames.has(c.toLowerCase())
  ).slice(0, 10)

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
                Active Weather Station
              </span>
              <Badge variant="success-outline">LIVE SYNC</Badge>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Currently monitoring live telemetry for{" "}
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
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Badge
            variant={isMaxPinned ? "warning-outline" : "primary-outline"}
            className="font-mono text-xs uppercase"
          >
            {pinnedCities.length}/{MAX_PINNED_CITIES} Saved
          </Badge>
        </div>
      </Alert>

      {/* Add Station Card with Autocomplete Search & Tabbed Discovery */}
      <Card className="overflow-visible relative z-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Plus className="size-4 text-primary" />
            <span>Add & Discover Stations</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Search global observation sites or discover regional and major meteorological hubs.
          </CardDescription>
          <CardAction>
            <Badge
              variant={isMaxPinned ? "warning-outline" : "primary-outline"}
              className="font-mono text-xs uppercase"
            >
              {pinnedCities.length}/{MAX_PINNED_CITIES} {isMaxPinned ? "Limit" : "Pinned"}
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
                  onChange={(e) => {
                    setNewCityInput(e.target.value)
                    setIsSearchOpen(true)
                  }}
                  onFocus={() => {
                    if (newCityInput.trim().length >= SEARCH_MIN_QUERY_LENGTH) {
                      setIsSearchOpen(true)
                    }
                  }}
                  placeholder={
                    isMaxPinned
                      ? `Maximum ${MAX_PINNED_CITIES} stations pinned (limit reached)...`
                      : "Search city, airport or coordinate (e.g. Madrid, Zurich, 28.65, 77.23)..."
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
                        onClick={() => {
                          setNewCityInput("")
                          setSearchResults([])
                          setIsSearchOpen(false)
                        }}
                        title="Clear"
                      >
                        <X className="size-3" />
                      </InputGroupButton>
                    )}
                  </InputGroupAddon>
                )}
              </InputGroup>
            </form>

            {/* Live Autocomplete Search Results Dropdown */}
            {isSearchOpen && newCityInput.trim().length >= SEARCH_MIN_QUERY_LENGTH && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 text-xs gap-0 pb-0">
                <CardHeader className="flex flex-row items-center justify-between font-mono text-tiny text-muted-foreground uppercase sticky top-0 z-10">
                  <CardTitle className="font-mono text-tiny font-normal text-muted-foreground uppercase">
                    Station Search Results
                  </CardTitle>
                  <CardAction className="self-center font-mono text-tiny">
                    {isSearching ? (
                      <span className="flex items-center gap-1 text-primary">
                        <Spinner className="size-2.5" />
                        Searching...
                      </span>
                    ) : (
                      <span>{searchResults.length} found</span>
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
                        title="Locating meteorological stations…"
                        className="py-4"
                      />
                    ) : searchResults.length > 0 ? (
                      <ItemGroup className="gap-0">
                        {searchResults.map((r, i) => {
                          const isAlreadyPinned = pinnedCities.some(
                            (c) => c.toLowerCase() === r.name.toLowerCase()
                          )
                          const isSelectDisabled = isAlreadyPinned || isMaxPinned
                          return (
                            <React.Fragment key={`${r.name}-${r.lat}-${r.lon}-${i}`}>
                              <Item
                                role="button"
                                tabIndex={isSelectDisabled ? -1 : 0}
                                onClick={() => {
                                  if (!isSelectDisabled) {
                                    handleSelectSearchResult(r)
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    (e.key === "Enter" || e.key === " ") &&
                                    !isSelectDisabled
                                  ) {
                                    e.preventDefault()
                                    handleSelectSearchResult(r)
                                  }
                                }}
                                className={cn(
                                  "justify-between transition-colors",
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
                                      Pinned
                                    </Badge>
                                  ) : isMaxPinned ? (
                                    <Badge
                                      variant="destructive-light"
                                      className="font-mono text-tiny"
                                    >
                                      Limit {MAX_PINNED_CITIES}/{MAX_PINNED_CITIES}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="primary-light"
                                      className="font-mono text-tiny gap-1 text-primary"
                                    >
                                      <Plus className="size-2.5" />
                                      Pin
                                    </Badge>
                                  )}
                                </ItemActions>
                              </Item>
                              {i < searchResults.length - 1 && (
                                <ItemSeparator className="my-0" />
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
                        title="No Station Found"
                        description={`No station found for "${newCityInput}". Press Enter to pin as custom name.`}
                        className="py-3"
                      />
                    )}
                  </ScrollArea>
                </CardContent>
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
                  <span>Nearby Stations</span>
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
                  <span>Popular Hubs</span>
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
                  Near {nearbyCurrentCity}
                </span>
              )}
            </div>

            {/* Tab 1: Nearby Stations */}
            <TabsContent value="nearby">
              {nearbyLoading ? (
                <div className="flex items-center gap-2 py-1.5 font-mono text-tiny text-muted-foreground">
                  <Spinner className="size-3 text-primary" />
                  <span>Scanning regional telemetry stations...</span>
                </div>
              ) : filteredNearbyCities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {filteredNearbyCities.slice(0, 8).map((targetCity) => (
                    <Badge
                      key={`${targetCity.name}-${targetCity.country}`}
                      variant="outline"
                      role="button"
                      tabIndex={isMaxPinned ? -1 : 0}
                      onClick={() => {
                        if (!isMaxPinned) onAddPinnedCity(targetCity.name)
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !isMaxPinned) {
                          e.preventDefault()
                          onAddPinnedCity(targetCity.name)
                        }
                      }}
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
              ) : coords && nearbyCities.length > 0 ? (
                <EmptyState
                  variant="ghost"
                  size="sm"
                  icon={Check}
                  withIconStack={false}
                  title="All Nearby Stations Saved"
                  description="All regional telemetry stations in this range are already in your favorites."
                  className="py-3"
                />
              ) : (
                <EmptyState
                  variant="ghost"
                  size="sm"
                  icon={Navigation}
                  withIconStack={false}
                  title="No Regional Stations Detected"
                  description="No regional stations detected for current coordinates. Try Popular Hubs or search above."
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
                      role="button"
                      tabIndex={isMaxPinned ? -1 : 0}
                      onClick={() => {
                        if (!isMaxPinned) onAddPinnedCity(popularCity)
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !isMaxPinned) {
                          e.preventDefault()
                          onAddPinnedCity(popularCity)
                        }
                      }}
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
                  title="All Popular Hubs Added"
                  description="All default major regional hubs are already in your favorites."
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
          title="No Pinned Stations"
          description="Add frequent locations or research observatories above for instant one-click synoptic access."
        />
      ) : (
        <Card className="pb-0 relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Star className="size-4 text-chart-5" />
              <span>Saved Stations</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {pinnedCities.length} / {MAX_PINNED_CITIES} stations saved for quick telemetry access
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
                        Ground Station Telemetry
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions className="gap-1.5 shrink-0">
                      <Button
                        variant="accent"
                        size="icon-sm"
                        title="Select Station"
                        disabled={selectingCity === cityName || removingCity === cityName}
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
                        disabled={selectingCity === cityName || removingCity === cityName}
                        onClick={() => handleRemoveStation(cityName)}
                        className="gap-1 font-mono text-xs"
                        title="Remove from favorites"
                      >
                        {removingCity === cityName ? (
                          <Spinner className="size-4" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
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
