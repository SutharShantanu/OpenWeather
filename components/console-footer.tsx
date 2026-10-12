"use client"

import React from "react"
import Image from "next/image"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardArrow,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dot } from "@/components/ui/dot"
import { ButtonGroup } from "@/components/ui/button-group"
import { Separator } from "@/components/ui/separator"
import { IconTile } from "@/components/ui/icon-tile"
import { useTranslation } from "@/components/language-provider"
import { MapPin, Globe, ExternalLink, Radio } from "lucide-react"
import { CONSOLE_AUTHOR, CONSOLE_LINKS } from "@/lib/constants"

const AUTHOR_NAME = process.env.NEXT_PUBLIC_AUTHOR_NAME || CONSOLE_AUTHOR.name
const AUTHOR_SHORT_NAME =
  process.env.NEXT_PUBLIC_AUTHOR_SHORT_NAME || CONSOLE_AUTHOR.shortName
const AUTHOR_HANDLE =
  process.env.NEXT_PUBLIC_AUTHOR_HANDLE || CONSOLE_AUTHOR.handle
const AUTHOR_ROLE = process.env.NEXT_PUBLIC_AUTHOR_ROLE || CONSOLE_AUTHOR.role
const AUTHOR_BIO = process.env.NEXT_PUBLIC_AUTHOR_BIO || CONSOLE_AUTHOR.bio
const AUTHOR_LOCATION =
  process.env.NEXT_PUBLIC_AUTHOR_LOCATION || CONSOLE_AUTHOR.location
const AUTHOR_AVATAR_URL =
  process.env.NEXT_PUBLIC_AUTHOR_AVATAR_URL || CONSOLE_AUTHOR.avatarUrl
const AUTHOR_AVATAR_FALLBACK =
  process.env.NEXT_PUBLIC_AUTHOR_AVATAR_FALLBACK ||
  CONSOLE_AUTHOR.avatarFallback
const AUTHOR_GITHUB_URL =
  process.env.NEXT_PUBLIC_AUTHOR_GITHUB_URL || CONSOLE_AUTHOR.githubUrl
const AUTHOR_PORTFOLIO_URL =
  process.env.NEXT_PUBLIC_AUTHOR_PORTFOLIO_URL || CONSOLE_AUTHOR.portfolioUrl
const AUTHOR_PORTFOLIO_DISPLAY =
  process.env.NEXT_PUBLIC_AUTHOR_PORTFOLIO_DISPLAY ||
  CONSOLE_AUTHOR.portfolioDisplay
const AUTHOR_REPOS_COUNT =
  process.env.NEXT_PUBLIC_AUTHOR_REPOS_COUNT || CONSOLE_AUTHOR.stats.repos
const AUTHOR_FOLLOWERS_COUNT =
  process.env.NEXT_PUBLIC_AUTHOR_FOLLOWERS_COUNT ||
  CONSOLE_AUTHOR.stats.followers

const GITHUB_REPO_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL || CONSOLE_LINKS.githubRepoUrl
const GITHUB_ICON_SVG_URL =
  process.env.NEXT_PUBLIC_GITHUB_ICON_SVG_URL || CONSOLE_LINKS.githubIconSvgUrl
const CURRENT_YEAR = new Date().getFullYear()

function GithubIcon({
  className,
  width = 24,
  height = 24,
  alt = "GitHub",
  ...props
}: Partial<React.ComponentProps<typeof Image>>) {
  return (
    <Image
      src={GITHUB_ICON_SVG_URL}
      alt={alt}
      width={width}
      height={height}
      className={className ? `dark:invert ${className}` : "dark:invert"}
      {...props}
    />
  )
}

interface ConsoleFooterProps {
  footerText?: string
}

export function ConsoleFooter({ footerText }: ConsoleFooterProps) {
  const { t } = useTranslation()
  const displayTitle = footerText || t.common.consoleFooter

  return (
    <Card
      role="contentinfo"
      className="relative w-full gap-0 border-none p-0 font-mono text-xs"
    >
      {/* Top Telemetry Header */}
      <CardContent className="mx-auto w-full max-w-7xl py-0">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Brand & Console Telemetry */}
          <div className="space-y-1.5 md:max-w-xs lg:max-w-sm">
            <div className="flex items-center gap-2">
              <Dot variant="success" size="md" pulse />
              <CardTitle className="font-mono text-xs font-semibold tracking-wider text-foreground uppercase">
                {displayTitle}
              </CardTitle>
            </div>
            <CardDescription className="font-sans text-xs text-muted-foreground">
              {t.footer.description}
            </CardDescription>
          </div>

          <Separator orientation="vertical" className="hidden h-19 md:block" />
          <Separator orientation="horizontal" className="md:hidden" />

          {/* Author with Minimal HoverCard */}
          <div className="flex flex-col items-start gap-2 md:items-center">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-auto gap-2.5 p-2 text-xs font-medium text-foreground transition-all"
                >
                  <a
                    href={AUTHOR_GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Avatar className="size-5 border border-border">
                      <AvatarImage src={AUTHOR_AVATAR_URL} alt={AUTHOR_NAME} />
                      <AvatarFallback className="bg-primary/10 text-tiny font-bold text-primary">
                        {AUTHOR_AVATAR_FALLBACK}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold tracking-tight">
                      {AUTHOR_SHORT_NAME}
                    </span>
                    <span className="font-mono text-tiny text-muted-foreground">
                      {AUTHOR_HANDLE}
                    </span>
                    <GithubIcon
                      alt={t.footer.github}
                      className="size-3.5 text-muted-foreground transition-colors"
                    />
                  </a>
                </Button>
              </HoverCardTrigger>

              <HoverCardContent align="center" side="top" className="w-72">
                <div className="space-y-2.5 font-sans">
                  {/* Profile Header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Avatar className="size-9 border border-border ring-1 ring-primary/20">
                          <AvatarImage
                            src={AUTHOR_AVATAR_URL}
                            alt={AUTHOR_SHORT_NAME}
                          />
                          <AvatarFallback className="font-mono text-xs font-bold text-primary">
                            {AUTHOR_AVATAR_FALLBACK}
                          </AvatarFallback>
                        </Avatar>
                        <Dot
                          variant="success"
                          size="xs"
                          className="absolute -right-0.5 -bottom-0.5 ring-1 ring-popover"
                          title={t.footer.online}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-semibold text-foreground">
                            {AUTHOR_SHORT_NAME}
                          </h4>
                          <Badge
                            variant="secondary"
                            size="xs"
                            className="font-mono text-[0.6rem]"
                          >
                            {AUTHOR_ROLE}
                          </Badge>
                        </div>
                        <a
                          href={AUTHOR_GITHUB_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-tiny text-primary transition-colors hover:underline"
                        >
                          {AUTHOR_HANDLE}
                        </a>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="icon-xs"
                      aria-label={t.footer.githubProfile}
                    >
                      <a
                        href={AUTHOR_GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GithubIcon
                          alt={t.footer.github}
                          className="size-3.5"
                        />
                      </a>
                    </Button>
                  </div>

                  {/* Bio */}
                  <p className="text-tiny leading-relaxed text-muted-foreground">
                    {AUTHOR_BIO}
                  </p>

                  <Separator />

                  {/* Location & Portfolio Links */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-tiny text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <IconTile
                        variant="soft"
                        size="xs"
                        className="text-primary"
                      >
                        <MapPin />
                      </IconTile>
                      <span>{AUTHOR_LOCATION}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconTile
                        variant="soft"
                        size="xs"
                        className="text-primary"
                      >
                        <Globe />
                      </IconTile>
                      <a
                        href={AUTHOR_PORTFOLIO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground transition-colors hover:text-primary hover:underline"
                      >
                        {AUTHOR_PORTFOLIO_DISPLAY}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  {/* Minimal Stats & Action */}
                  <div className="flex items-center justify-between font-mono text-tiny">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Badge variant="outline" size="xs">
                        <strong className="text-foreground">
                          {AUTHOR_REPOS_COUNT}
                        </strong>
                        &nbsp;{t.footer.repos}
                      </Badge>
                      <Badge variant="outline" size="xs">
                        <strong className="text-foreground">
                          {AUTHOR_FOLLOWERS_COUNT}
                        </strong>
                        &nbsp;{t.footer.followers}
                      </Badge>
                    </div>

                    <Button
                      asChild
                      variant="ghost"
                      size="xs"
                      className="h-6 gap-1 px-1.5 text-tiny font-medium text-primary hover:text-primary hover:underline"
                    >
                      <a
                        href={AUTHOR_GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{t.footer.profile}</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    </Button>
                  </div>
                </div>
                <HoverCardArrow className="fill-popover" />
              </HoverCardContent>
            </HoverCard>
          </div>

          <Separator orientation="vertical" className="hidden h-19 md:block" />
          <Separator orientation="horizontal" className="md:hidden" />

          {/* Repository & Source Icon Buttons */}
          <div className="flex flex-col gap-2 md:items-end">            
            <ButtonGroup>
              <Button
                asChild
                variant="outline"
                size="sm"
                title={t.footer.githubRepo}
                aria-label={t.footer.githubRepo}
              >
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon alt={t.footer.github} className="size-3.5" />
                  <span>OpenWeather</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                title={t.footer.portfolio}
                aria-label={t.footer.portfolio}
              >
                <a
                  href={AUTHOR_PORTFOLIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="size-3.5" />
                  <span>Portfolio</span>
                </a>
              </Button>
            </ButtonGroup>            
          </div>
        </div>
      </CardContent>

      {/* Bottom Sub-bar */}
      <CardFooter className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-border/60 px-4 py-4 pb-20 text-center text-tiny text-muted-foreground sm:flex-row sm:pb-4 sm:text-start md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
          <span className="font-semibold text-foreground">
            {t.footer.consoleBrand}
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span>{t.footer.dataSource}</span>
        </div>
        <div className="font-mono text-muted-foreground/80">
          © {CURRENT_YEAR} {AUTHOR_NAME}. {t.footer.allRightsReserved}
        </div>
      </CardFooter>
    </Card>
  )
}
