# Compare & Favorites User Journey - Comprehensive Architecture Review

## Executive Summary

After deep analysis of the codebase, I've identified several architectural issues that explain the user's reported problems. The core issues stem from **state synchronization gaps**, **stale closure problems**, and **missing cleanup logic** - not from a single bug but from a collection of edge cases that compound under specific conditions.

---

## 1. Complete User Journey Map

### Journey 1: Adding to Compare (Properties Page)

```
User on /properties
    ↓
Sees Property Cards (each has CompareButton)
    ↓
Clicks "Compare" on Property A
    ↓
CompareButton calls toggleCompare(propertyId)
    ↓
useCompare hook checks: is property already in list?
    - If YES: Show toast "Already in compare" → Exit
    - If NO and list < 3: setCompareList([...prev, propertyId])
    ↓
State update triggers:
    1. localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
    2. window.dispatchEvent(new CustomEvent(COMPARE_CHANGE_EVENT))
    ↓
CompareButton re-renders (isInCompare now returns true)
    ↓
ComparisonBar (floating at bottom) receives compareList update
    ↓
ComparisonBar's useEffect([compareList]) triggers
    ↓
loadProperties() fetches each property's data via getPropertyById()
    ↓
Thumbnails appear in floating bar with property name + grade
    ↓
User clicks "Compare" on Property B
    ↓
Same flow → compareList now has [A, B]
    ↓
Floating bar shows "2/3" with both property thumbnails
    ↓
User clicks "Compare" on Property C
    ↓
compareList now has [A, B, C]
    ↓
isFull = true, canAddMore = false
    ↓
Other properties' CompareButtons show disabled state (Lock icon)
    ↓
Floating bar shows "3/3" with lock icon
    ↓
User clicks "Compare" button in floating bar
    ↓
Navigates to /compare page
    ↓
ComparisonView loads, fetches full property data + transactions
    ↓
Displays 3-column comparison grid
```

### Journey 2: Removing from Compare

```
User clicks X on Property B in floating bar
    ↓
removeFromCompare(propertyId) called
    ↓
setCompareList(prev.filter(id => id !== propertyId))
    ↓
localStorage updated, custom event dispatched
    ↓
ComparisonBar's useEffect triggers
    ↓
Properties state updated: [A, C] only
    ↓
Thumbnails updated to show just A and C
    ↓
Floating bar shows "2/3"
    ↓
User removes last property (A or C)
    ↓
compareList becomes []
    ↓
ComparisonBar returns null (hidden)
```

### Journey 3: Page Navigation (State Persistence)

```
User on /properties, added properties A, B to compare
    ↓
Navigate to /favorites (via link)
    ↓
FavoritesPage loads, calls useCompare()
    ↓
Hook initializes: reads localStorage → gets [A, B]
    ↓
FavoritesPage's useEffect triggers (isLoaded now true)
    ↓
loadProperties() fetches favorites
    ↓
User sees favorites with compare state preserved
    ↓
User clicks back to /properties
    ↓
Properties page loads, useCompare() reads localStorage
    ↓
Compare buttons show correct state for A and B
    ↓
ComparisonBar appears with A, B
```

---

## 2. Architecture Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LOCALSTORAGE                                   │
│                    Key: 'hk-cre-compare-v2'                             │
│                         ["prop-id-1", "prop-id-2"]                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↑
                                    │ Read on mount
                                    │ Write on change
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        useCompare() Hook                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ compareList │  │ compareCount│  │ isLoaded    │  │ add/remove/     │ │
│  │ State       │  │ Derived     │  │ Hydration   │  │ toggle funcs    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
        ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
        │ CompareButton │ │ ComparisonBar │ │ ComparisonView│
        │ (per property)│ │ (floating)    │ │ (/compare page)│
        └───────────────┘ └───────────────┘ └───────────────┘
                                    │
                                    ↓
                    ┌───────────────────────────────┐
                    │   usePropertyData() Hook       │
                    │   - getPropertyById()          │
                    │   - getPropertyTransactions()  │
                    └───────────────────────────────┘
                                    │
                                    ↓
                    ┌───────────────────────────────┐
                    │        Supabase DB             │
                    │    (properties, transactions)  │
                    └───────────────────────────────┘
```

---

## 3. Identified Issues (Root Cause Analysis)

### Issue #1: Stale Closure in Callback Functions

**Location:** `hooks/use-compare.ts` - `addToCompare`, `removeFromCompare`, `toggleCompare`

**The Problem:**
```typescript
const addToCompare = useCallback((propertyId: string) => {
  if (compareList === null) return
  
  // This check uses the STALE compareList from closure!
  if (compareList.includes(propertyId)) {
    // ...
  }
  // ...
}, [compareList, toast, t])
```

When user clicks rapidly or when state updates are batched, `compareList` in the closure may be outdated. The function captures `compareList` at render time, but React may batch multiple state updates.

**Impact:** 
- Can add duplicate properties to compare list
- "Already in compare" toast may not show when expected
- Counter can show wrong number

**Evidence:** User reported "Counter shows wrong number" and "floating bar thumbnails don't update timely"

---

### Issue #2: Race Condition Between State and localStorage

**Location:** `hooks/use-compare.ts` - Save effect

**The Problem:**
```typescript
// Save to localStorage whenever list changes
useEffect(() => {
  if (!isClient.current || compareList === null) return
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList))
  window.dispatchEvent(new CustomEvent(COMPARE_CHANGE_EVENT))
}, [compareList])
```

The custom event is dispatched AFTER localStorage is set, but:
1. Multiple rapid clicks can batch state updates
2. The event fires on every change, potentially causing cascading re-renders
3. The `compareList` in the event handler reads from localStorage immediately, but due to closure issues, different components may see different values momentarily

**Impact:**
- Floating bar shows stale data
- Counter displays incorrect number temporarily

---

### Issue #3: Missing Dependency in comparison-bar.tsx Effect

**Location:** `components/comparison/comparison-bar.tsx`

**The Problem:**
```typescript
useEffect(() => {
  async function loadProperties() {
    // ... loads properties based on compareList
  }
  loadProperties()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [compareList]) // getPropertyById is stable (useCallback with [] deps)
```

The comment says `getPropertyById` is stable, but the effect loads properties based on `compareList`. If `getPropertyById` were to change (it doesn't currently, but could in future), this would be stale.

**The Bigger Problem:** The effect runs whenever `compareList` reference changes. But `compareList` is a new array on every update (`[...prev, id]`), so the effect runs frequently.

---

### Issue #4: No Cleanup for Deleted Properties

**Location:** `components/comparison/comparison-view.tsx`

**The Problem:**
```typescript
const loaded = await Promise.all(
  compareList.map(async (id) => {
    const property = await getPropertyById(id)
    const transactions = await getPropertyTransactions(id)
    return property ? { ...property, transactions } : null
  })
)
setProperties(loaded.filter(p => p !== null) as PropertyWithTransactions[])
```

If a property is deleted from the database but still in `compareList`, it returns `null` and gets filtered out. BUT the `compareList` in localStorage and the hook is NEVER updated to remove the deleted property.

**Impact:** User reported "Cannot display all data" - some properties may not appear in compare view even though counter shows they're selected.

---

### Issue #5: Cross-Tab Sync Inconsistency

**Location:** `hooks/use-compare.ts` vs `hooks/use-favorites.ts`

**The Problem:**
- `use-compare.ts` HAS cross-tab sync via `storage` event
- `use-favorites.ts` does NOT have cross-tab sync

This inconsistency means favorites won't update if user has multiple tabs open, but compare will. This creates a confusing UX.

---

### Issue #6: The "Loop" - Potential for Infinite Re-renders

**Location:** `app/[locale]/favorites/page.tsx`

**The Problem:**
```typescript
// Sync selected items with compare list
useEffect(() => {
  setSelectedForCompare(new Set(compareList))
}, [compareList])
```

If a parent component or other effect causes `compareList` to change frequently, this could trigger cascades. Combined with the `hasLoadedRef` pattern, this creates potential for inconsistent states.

**In ComparisonBar:**
```typescript
useEffect(() => {
  const hasUnfavorited = properties.some(p => !isFavorite(p.id))
  setShowAddAllFavorites(hasUnfavorited)
}, [properties, isFavorite])
```

This effect depends on `properties` which is set by another effect, which depends on `compareList`. This is a chain of dependent effects that can cause unnecessary re-renders.

---

### Issue #7: Multiple Hook Instances = Multiple Sources of Truth

**The Problem:**
Every component that calls `useCompare()` gets its own state instance. While they're synchronized via localStorage and custom events, there's a brief moment during initialization where different components might have different states.

Example timeline:
1. Component A mounts, reads localStorage → gets [A, B]
2. User clicks in Component B (different part of tree)
3. Component B updates localStorage → [A, B, C]
4. Custom event fires
5. Component A receives event, updates state
6. BUT Component C (newly mounted) reads localStorage → gets [A, B, C]

During steps 4-5, Component A and B have different states.

---

### Issue #8: No Error Recovery for Corrupted localStorage

**Location:** `hooks/use-compare.ts` - Initial load

**The Problem:**
```typescript
try {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    setCompareList(parsed)
  }
} catch (e) {
  console.error('[useCompare] Failed to parse compare list:', e)
  setCompareList([])
}
```

If localStorage is corrupted (e.g., manually edited, or schema changed), it sets to empty array. But this doesn't clean up the corrupted localStorage entry, so on next refresh, same error occurs.

---

## 4. Why Previous Fixes Haven't Fully Worked

The user mentioned fixes were applied but issues persist. Here's why:

| Fix Applied | Why It Didn't Fully Work |
|-------------|-------------------------|
| Counter display fix | Fixed the display but not the stale closure causing wrong count |
| Floating bar thumbnail update | Fixed the loading but not the race condition between state and storage |
| "Some loop" fix | May have addressed one effect chain but not all of them |

**The fundamental issue:** The architecture has multiple independent states (hook instances) synchronized via events. This is inherently prone to race conditions. The fixes addressed symptoms (display issues) but not the root cause (state synchronization architecture).

---

## 5. Recommended Solution

### Option A: Centralized State Management (Recommended)

Move compare state to a React Context or Zustand store at the app level. This ensures a single source of truth.

```typescript
// stores/compare-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareStore {
  compareList: string[]
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  // ...
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareList: [],
      addToCompare: (id) => {
        const current = get().compareList
        if (current.includes(id)) return
        if (current.length >= 3) return
        set({ compareList: [...current, id] })
      },
      // ...
    }),
    { name: 'hk-cre-compare-v2' }
  )
)
```

**Benefits:**
- Single source of truth
- No custom event sync needed
- Built-in persistence with Zustand's persist middleware
- No stale closure issues (get() always returns current state)

### Option B: Fix Current Architecture (Incremental)

If staying with current hooks approach:

1. **Fix stale closures:** Use functional updates for all state checks
```typescript
const addToCompare = useCallback((propertyId: string) => {
  setCompareList(prev => {
    if (prev === null) return prev
    if (prev.includes(propertyId)) {
      // Show toast here
      return prev
    }
    if (prev.length >= MAX_COMPARE) {
      // Show toast here
      return prev
    }
    return [...prev, propertyId]
  })
}, []) // Empty deps - no stale closure!
```

2. **Add cleanup for deleted properties** in comparison-view.tsx

3. **Consolidate effect chains** to reduce re-render cascades

4. **Add localStorage error recovery** with cleanup

---

## 6. Testing Checklist

To verify fixes work:

- [ ] Rapid clicking on compare buttons doesn't add duplicates
- [ ] Counter always matches actual number of items in floating bar
- [ ] Floating bar thumbnails update within 1 second of adding
- [ ] Navigate to favorites and back - state persists correctly
- [ ] Open two tabs, add in one - other tab updates within 2 seconds
- [ ] Delete a property from database, refresh compare page - handles gracefully
- [ ] Add 3 properties, remove 1, add 1 - counter stays correct throughout
- [ ] Corrupt localStorage manually, refresh - app recovers gracefully

---

## Conclusion

The issues stem from a fundamental architectural pattern: multiple hook instances trying to stay synchronized. The fixes so far have addressed symptoms (display issues) but the underlying synchronization problem remains. A centralized state management solution (Zustand or Context) would provide the most robust fix.
