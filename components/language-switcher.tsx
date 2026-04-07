'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/src/i18n/routing'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh-hk', label: '繁體中文', flag: '🇭🇰' },
  { code: 'zh-cn', label: '简体中文', flag: '🇨🇳' },
]

export function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  const handleLanguageChange = (newLocale: string) => {
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current app, we can skip runtime checks.
      { pathname, params },
      { locale: newLocale }
    )
  }

  return (
    <div className="relative group">
      <Button variant="ghost" size="sm" className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <span className="text-sm">{currentLanguage.label}</span>
      </Button>
      
      <div className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-popover p-1 shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent ${
              locale === language.code ? 'bg-accent/50' : ''
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.label}</span>
            {locale === language.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
