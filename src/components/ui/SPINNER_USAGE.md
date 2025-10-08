# Professional Spinner Components

## Overview
Professional, animated loading spinners for the Karma Club application.

## Components

### 1. Spinner (Primary)
The main professional spinner with dual counter-rotating rings and optional logo.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `className`: Additional CSS classes
- `withLogo`: Boolean to show Karma Club logo in center (default: false)

**Usage:**
```tsx
import { Spinner } from '@/components/ui/spinner';

// Basic spinner
<Spinner size="md" />

// With logo
<Spinner size="lg" withLogo={true} />

// In a button
<Button disabled>
  <Spinner size="sm" className="mr-2" />
  Loading...
</Button>
```

### 2. SpinnerCircles
Gradient spinning ring with inner accent - perfect for modern UIs.

**Usage:**
```tsx
import { SpinnerCircles } from '@/components/ui/spinner';

<SpinnerCircles size="lg" />
```

### 3. SpinnerDots
Animated bouncing dots - great for inline loading states.

**Usage:**
```tsx
import { SpinnerDots } from '@/components/ui/spinner';

<SpinnerDots className="my-4" />
```

## Examples

### Page Loader
```tsx
import { Spinner } from '@/components/ui/spinner';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="xl" withLogo={true} />
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
}
```

### Button Loading State
```tsx
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner size="sm" className="mr-2" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### Card Loading
```tsx
import { SpinnerCircles } from '@/components/ui/spinner';

<Card>
  <CardContent className="flex items-center justify-center p-8">
    <SpinnerCircles size="md" />
  </CardContent>
</Card>
```

### Inline Loading
```tsx
import { SpinnerDots } from '@/components/ui/spinner';

<div>
  <p>Loading data<SpinnerDots className="inline-flex ml-2" /></p>
</div>
```

## Animation Details

### Spinner
- **Primary ring**: Clockwise rotation (1s)
- **Secondary ring**: Counter-clockwise rotation (1s)
- **Colors**: Emerald-500 and Blue-500

### SpinnerCircles
- **Outer gradient**: 0.7s rotation
- **Inner dashed ring**: 3s counter-clockwise

### SpinnerDots
- **Three dots**: Sequential bounce with 0.2s delay between each

## Customization

You can customize colors by modifying the component or using Tailwind classes:

```tsx
<Spinner 
  size="lg" 
  className="[&>div:nth-child(2)]:border-t-purple-500" 
/>
```
