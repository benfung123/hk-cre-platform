'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/routing'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Menu, X, Building2 } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { usePathname } from '@/src/i18n/routing'

export function Navbar() {
  const t = useTranslations('nav')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <Building2 className="h-6 w-6" />
          <span className="font-bold hidden sm:inline">{t('home')}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm font-medium flex-shrink-0">
          <Link href="/properties" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            {t('properties')}
          </Link>
          <Link href="/market-trends" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            {t('marketTrends')}
          </Link>
          <Link href="/favorites" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            {t('favorites')}
          </Link>
          <Link href="/compare" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            {t('compare')}
          </Link>
          <Link href="/analytics" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            {t('analytics')}
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          {/* Search - Hidden on small screens */}
          <form action="/properties" className="hidden md:flex items-center gap-2 max-w-[200px] xl:max-w-xs">
            <Input
              type="search"
              name="search"
              placeholder={t('searchPlaceholder')}
              className="h-8 w-full"
            />
            <Button type="submit" size="sm" variant="ghost" className="flex-shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Language & Auth - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">{t('login')}</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">{t('signup')}</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="lg:hidden border-t">
          <div className="container py-4 space-y-4">
            <form action="/properties" className="flex items-center space-x-2">
              <Input
                type="search"
                name="search"
                placeholder={t('searchPlaceholder')}
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="flex flex-col space-y-2">
              <Link href="/properties" className="py-2" onClick={() => setIsMenuOpen(false)}>
                {t('properties')}
              </Link>
              <Link href="/market-trends" className="py-2" onClick={() => setIsMenuOpen(false)}>
                {t('marketTrends')}
              </Link>
              <Link href="/favorites" className="py-2" onClick={() => setIsMenuOpen(false)}>
                {t('favorites')}
              </Link>
              <Link href="/compare" className="py-2" onClick={() => setIsMenuOpen(false)}>
                {t('compare')}
              </Link>
              <Link href="/analytics" className="py-2" onClick={() => setIsMenuOpen(false)}>
                {t('analytics')}
              </Link>
              <hr />
              <div className="py-2">
                <LanguageSwitcher />
              </div>
              <Link href="/login" className="py-2" onClick={() => setIsMenuOpen(false)}>
                {t('login')}
              </Link>
              <Link href="/signup" className="py-2" onClick={() => setIsMenuOpen(false)}>
                {t('signup')}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
