'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/routing'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Menu, X, Building2, Heart, Scale } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { usePathname } from '@/src/i18n/routing'

export function Navbar() {
  const t = useTranslations('nav')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <span className="font-bold">{t('home')}</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/properties" className="transition-colors hover:text-foreground/80">
              {t('properties')}
            </Link>
            <Link href="/favorites" className="transition-colors hover:text-foreground/80">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                Watchlist
              </span>
            </Link>
            <Link href="/compare" className="transition-colors hover:text-foreground/80">
              <span className="flex items-center gap-1">
                <Scale className="h-4 w-4" />
                Compare
              </span>
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
              {t('analytics')}
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex w-full max-w-sm items-center space-x-2">
            <form action="/properties" className="flex w-full items-center space-x-2">
              <Input
                type="search"
                name="search"
                placeholder={t('searchPlaceholder')}
                className="h-8"
              />
              <Button type="submit" size="sm" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">{t('login')}</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">{t('signup')}</Button>
            </Link>
          </div>
          
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden border-t">
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
              <Link href="/favorites" className="py-2" onClick={() => setIsMenuOpen(false)}>
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Watchlist
                </span>
              </Link>
              <Link href="/compare" className="py-2" onClick={() => setIsMenuOpen(false)}>
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Compare
                </span>
              </Link>
              <Link href="/dashboard" className="py-2" onClick={() => setIsMenuOpen(false)}>
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
