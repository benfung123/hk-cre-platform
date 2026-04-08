# Coding Standards for HK CRE Platform

## Pre-Commit Checklist
Before committing code, agents MUST run:
```bash
npm run validate
```
This runs type-check + lint. Fix all errors before pushing.

## TypeScript Rules

### 1. Type Predicate Patterns
**❌ DON'T:**
```typescript
.filter((p): p is PropertyPreview => p !== null)
// When PropertyPreview has flexible types
```

**✅ DO:**
```typescript
.filter(p => p !== null) as PropertyPreview[]
// Or ensure types match exactly
```

### 2. Interface vs Type
- Use `interface` for object shapes that will be extended
- Use `type` for unions, tuples, or mapped types

### 3. Strict Null Checks
**❌ DON'T:**
```typescript
const value = someObject.property // might be undefined
```

**✅ DO:**
```typescript
const value = someObject?.property ?? defaultValue
```

## i18n Patterns

### Client Components
```typescript
'use client'
import { useTranslations } from 'next-intl'

const t = useTranslations('namespace')
t('key', { count: value })
```

### Server Components
```typescript
import { getTranslations } from 'next-intl/server'

const t = await getTranslations('namespace')
t('key')
```

### Translation Keys
- Use camelCase for district keys: `SheungWan`, `YauMaTei`
- Use dot notation for nested keys: `properties.filters.byGrade`

## Component Patterns

### Props Interfaces
```typescript
interface MyComponentProps {
  id: string
  name: string
  optional?: boolean
  callback: (id: string) => void
}

export function MyComponent({ id, name, optional, callback }: MyComponentProps) {
  // ...
}
```

### Async Effects
```typescript
useEffect(() => {
  async function loadData() {
    const result = await fetchData()
    setData(result)
  }
  loadData()
}, [dependency])
```

## Common Error Patterns to Avoid

### 1. Type Mismatches in Filter
```typescript
// ❌ Wrong - type predicate incompatible
.filter((p): p is Type => p !== null)

// ✅ Correct
.filter(p => p !== null) as Type[]
```

### 2. Missing 'use client'
```typescript
// ❌ Wrong - hooks in server component
import { useState } from 'react'

// ✅ Correct
'use client'
import { useState } from 'react'
```

### 3. Incorrect Translation Usage
```typescript
// ❌ Wrong - hardcoded strings
<button>Save</button>

// ✅ Correct
<button>{t('save')}</button>
```

## File Organization

```
my-app/
├── app/[locale]/          # Page routes
├── components/
│   ├── ui/                # shadcn components
│   ├── comparison/        # Feature-specific
│   └── favorites/
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── messages/              # i18n translations
└── types/                 # Shared types
```

## Git Workflow

1. **Before commit:**
   ```bash
   npm run validate
   ```

2. **Commit message format:**
   ```
   type: Description
   
   Types:
   - feat: New feature
   - fix: Bug fix
   - refactor: Code refactoring
   - ui: UI changes
   - i18n: Translation updates
   - docs: Documentation
   ```

3. **Push only after validation passes**

## Testing Changes

Before marking a task complete:
1. Run `npm run validate` - must pass
2. Run `npm run build` locally if possible
3. Check Vercel deployment for errors
4. Verify in browser (if applicable)

## Emergency Fixes

If main branch is broken:
1. Fix immediately with `fix: ...` commit
2. Don't add new features until build is green
3. Notify team if fix is complex

---

**Remember:** Green build > fast commits. Always validate before pushing.