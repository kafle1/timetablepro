# Development Guide

## Prerequisites

- Node.js v16+
- Yarn
- Appwrite Cloud account
- VS Code (recommended)

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure environment:
```bash
cp .env.example .env
# Update .env with your Appwrite credentials
```

3. Start development:
```bash
yarn dev
```

## Project Structure

```
timetablepro/
├── src/
│   ├── lib/
│   │   ├── components/  # UI components
│   │   ├── services/    # API services
│   │   ├── stores/      # State management
│   │   └── utils/       # Helpers
│   └── routes/          # Pages
├── static/              # Assets
└── tests/              # Test files
```

## Key Guidelines

### Components

```svelte
<script lang="ts">
  interface $$Props {
    title: string;
  }
  export let title: $$Props['title'];
</script>

<div class="card">
  <h2>{title}</h2>
</div>
```

### State Management

```typescript
// stores/auth.ts
import { writable } from 'svelte/store';

export const authStore = writable({
  user: null,
  loading: false
});
```

### Testing

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

describe('Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(Component);
    expect(getByText('Title')).toBeTruthy();
  });
});
``` 