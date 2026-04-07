# Internationalization (i18n) Documentation

This document describes the multi-language support implementation for the HK Commercial Real Estate Platform.

## Supported Languages

The platform supports three languages:

| Language | Code | Flag | File |
|----------|------|------|------|
| English (Default) | `en` | 🇺🇸 | `messages/en.json` |
| Traditional Chinese | `zh-hk` | 🇭🇰 | `messages/zh-hk.json` |
| Simplified Chinese | `zh-cn` | 🇨🇳 | `messages/zh-cn.json` |

## URL Structure

The application uses locale-prefixed URLs:

- `/en/` - English version
- `/zh-hk/` - Traditional Chinese version
- `/zh-cn/` - Simplified Chinese version
- `/` - Redirects to `/en/` (default locale)

## Implementation

### Technology Stack

- **next-intl**: The internationalization library for Next.js 14+
- **Middleware**: Handles locale detection and routing
- **Server Components**: Full support with async translation loading
- **Client Components**: Uses `useTranslations()` hook

### File Structure

```
my-app/
├── messages/                    # Translation files
│   ├── en.json                 # English translations
│   ├── zh-hk.json              # Traditional Chinese translations
│   └── zh-cn.json              # Simplified Chinese translations
├── src/
│   └── i18n/
│       ├── routing.ts          # Routing configuration
│       └── request.ts          # Request configuration
├── app/
│   ├── [locale]/               # Localized routes
│   │   ├── page.tsx            # Home page
│   │   ├── properties/         # Properties pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── layout.tsx              # Root layout with i18n provider
│   └── page.tsx                # Root redirect page
├── components/
│   ├── language-switcher.tsx   # Language switcher component
│   ├── navbar.tsx              # Navigation with translations
│   ├── property-list.tsx       # Property list with translations
│   └── property-filters.tsx    # Filters with translations
├── middleware.ts               # i18n middleware
└── next.config.ts              # Next.js config with i18n
```

### Key Components

#### 1. Language Switcher

The `LanguageSwitcher` component is located in the navbar and allows users to switch between languages:

```tsx
import { LanguageSwitcher } from '@/components/language-switcher'

// Usage
<LanguageSwitcher />
```

Features:
- Dropdown menu with flags (🇺🇸 🇭🇰 🇨🇳)
- Shows current language
- Updates URL and maintains current page on selection
- Works in both desktop and mobile views

#### 2. Translations in Server Components

```tsx
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations()
  
  return (
    <h1>{t('home.hero.title')}</h1>
  )
}
```

#### 3. Translations in Client Components

```tsx
'use client'
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations()
  
  return (
    <h1>{t('home.hero.title')}</h1>
  )
}
```

#### 4. Navigation Links

Use the `Link` component from `@/src/i18n/routing` to maintain the current locale:

```tsx
import { Link } from '@/src/i18n/routing'

<Link href="/properties">Properties</Link>
```

## Translation Keys

### Structure

```json
{
  "metadata": {
    "title": "...",
    "description": "..."
  },
  "nav": {
    "home": "...",
    "properties": "...",
    "login": "...",
    "signup": "..."
  },
  "home": {
    "hero": { ... },
    "stats": { ... },
    "featured": { ... }
  },
  "properties": {
    "page": { ... },
    "filters": { ... },
    "card": { ... }
  },
  "propertyDetail": { ... },
  "districts": {
    "Central": "...",
    "Admiralty": "...",
    ...
  },
  "language": {
    "en": "English",
    "zh-hk": "繁體中文",
    "zh-cn": "简体中文"
  }
}
```

### District Translations

District names are translated using keys without spaces:

| English | Translation Key |
|---------|----------------|
| Central | `districts.Central` |
| Admiralty | `districts.Admiralty` |
| Wan Chai | `districts.WanChai` |
| Causeway Bay | `districts.CausewayBay` |
| Tsim Sha Tsui | `districts.TsimShaTsui` |
| Mong Kok | `districts.MongKok` |
| North Point | `districts.NorthPoint` |
| Quarry Bay | `districts.QuarryBay` |
| Kowloon Bay | `districts.KowloonBay` |
| Kwun Tong | `districts.KwunTong` |

## Adding New Translations

1. Add the key to all three translation files (`en.json`, `zh-hk.json`, `zh-cn.json`)
2. Use the translation in components with `t('key.subkey')`
3. For server components: `const t = await getTranslations()`
4. For client components: `const t = useTranslations()`

## Configuration

### next.config.ts

```typescript
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
```

### middleware.ts

```typescript
import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(zh-hk|zh-cn|en)/:path*']
};
```

### src/i18n/routing.ts

```typescript
import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'zh-hk', 'zh-cn'],
  defaultLocale: 'en'
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
```

## Font Considerations

The platform uses the Geist font family which supports Latin characters. For Chinese characters, the system will fall back to appropriate system fonts:

- **Traditional Chinese**: "PingFang HK", "Heiti TC", "Microsoft JhengHei"
- **Simplified Chinese**: "PingFang SC", "Heiti SC", "Microsoft YaHei"

## Testing

1. **URL Routing**: Verify all three language URLs work:
   - `http://localhost:3000/en`
   - `http://localhost:3000/zh-hk`
   - `http://localhost:3000/zh-cn`

2. **Language Switcher**: Test switching languages on different pages

3. **Language Persistence**: Verify the selected language is maintained when navigating

4. **Chinese Font Display**: Check that Chinese characters render correctly

5. **District Names**: Verify district names are translated in:
   - Property cards
   - Filters dropdown
   - District overview section
   - Property detail page

## Deployment

The application is configured for Vercel deployment. The i18n routing works automatically with the middleware configuration.

### Build Commands

```bash
npm run build
```

### Environment Variables

No additional environment variables are required for i18n functionality.

## Troubleshooting

### Common Issues

1. **404 on locale routes**: Ensure the `[locale]` folder structure is correct
2. **Translations not loading**: Check that translation files are in the `messages/` folder
3. **Middleware not working**: Verify `middleware.ts` is at the project root
4. **Client-side navigation**: Use `Link` from `@/src/i18n/routing` instead of Next.js `Link`

### Debug Mode

To debug i18n issues, check the browser console for missing translation key warnings.

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
