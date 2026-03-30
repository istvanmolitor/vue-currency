# Vue Currency Package

Vue.js frontend package for currency management with full CRUD operations.

## Features

- List currencies with pagination, search, and sorting
- Create new currencies
- Edit existing currencies
- Delete currencies (with protection for default currency)
- Full TypeScript support

## Structure

```
vue-currency/
├── services/
│   └── currencyService.ts    # API service for currency operations
├── views/
│   └── currency/
│       ├── CurrencyIndex.vue # List view
│       ├── CurrencyCreate.vue # Create form
│       └── CurrencyEdit.vue   # Edit form
├── router/
│   └── index.ts              # Route definitions
├── config/
│   └── menu.ts               # Menu configuration
└── index.ts                  # Package exports
```

## Usage

### Import services

```typescript
import { currencyService, type Currency } from '@currency'
```

### Add routes to your router

```typescript
import { router as currencyRoutes } from '@currency'

const router = createRouter({
  routes: [
    ...currencyRoutes,
    // other routes
  ]
})
```

### Add menu items

```typescript
import { currencyMenuConfig } from '@currency'
```

## API Endpoints

- `GET /api/admin/currency/currencies` - List currencies
- `GET /api/admin/currency/currencies/create` - Get create form data
- `POST /api/admin/currency/currencies` - Create currency
- `GET /api/admin/currency/currencies/{id}` - Show currency
- `GET /api/admin/currency/currencies/{id}/edit` - Get edit form data
- `PUT /api/admin/currency/currencies/{id}` - Update currency
- `DELETE /api/admin/currency/currencies/{id}` - Delete currency

