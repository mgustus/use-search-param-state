# use-search-param-state

A React hook that syncs typed state with URL search params. Works like `useState`, but the value lives in the URL — surviving page refreshes, enabling shareable links, and supporting browser back/forward navigation.

Uses [Standard Schema](https://github.com/standard-schema/standard-schema) for parsing and validation, so it works with **arktype**, **Zod**, **Valibot**, and any other compliant library.

## Install

```bash
npm install use-search-param-state
# or
yarn add use-search-param-state
```

**Peer dependencies:** `react` >= 16.8, `react-dom` >= 16.8

## Quick Example

```tsx
import { useSearchParamState } from 'use-search-param-state';
import { type } from 'arktype';

const pageSchema = type('string.numeric.parse');

function MyComponent() {
  const [page, setPage] = useSearchParamState('page', pageSchema, 1);

  return (
    <div>
      <p>Current page: {page}</p>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>
    </div>
  );
}
```

The URL updates automatically (e.g. `?page=2`). When `page` equals the default value (`1`), the param is omitted from the URL to keep it clean.

## API

### `useSearchParamState(paramName, schema, defaultValue)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `paramName` | `string` | The URL search param key |
| `schema` | `StandardSchemaV1` | A Standard Schema to parse/validate the string param into the desired type |
| `defaultValue` | `T` | Fallback when param is missing or invalid |

**Returns** `[value, setValue]` — same tuple shape as `useState`.

The setter accepts a value or a functional updater (`(prev) => next`), just like `useState`. Setting a value equal to `defaultValue` removes the param from the URL.

### `parseParam(strValue, schema, defaultValue)`

A standalone helper for parsing a string param without the hook. Useful for server-side rendering in Next.js, where you parse `searchParams` on the server and pass the result to a client component.

Available from both the main entry and the server-safe subpath:

```ts
// In a Server Component (no React hooks in scope)
import { parseParam } from 'use-search-param-state/server';

// In a Client Component (also re-exported from the main entry)
import { parseParam } from 'use-search-param-state';
```

### `useSearchParam(paramName)`

Low-level hook that returns the raw string value of a single URL search param. Re-renders when that param changes (via `useSyncExternalStore`).

## Schema Examples

**arktype:**
```ts
import { type } from 'arktype';

const stringSchema = type('string');
const numberSchema = type('string.numeric.parse');
const boolSchema = type('string.json.parse').pipe(type('boolean'));
const objectSchema = type('string.json.parse').pipe(
  type({ pageIndex: 'number', pageSize: 'number' })
);
```

**Zod:**
```ts
import { z } from 'zod';

const stringSchema = z.string();
const numberSchema = z.coerce.number();
const boolSchema = z.string().transform(s => JSON.parse(s)).pipe(z.boolean());
const objectSchema = z.string().transform(s => JSON.parse(s)).pipe(
  z.object({ pageIndex: z.number(), pageSize: z.number() })
);
```

## Examples

Three example apps showcase the hook with a products table (search, category filter, sorting, pagination — all stored in URL search params).

### Run locally

```bash
git clone https://github.com/mgustus/use-search-param-state.git
cd use-search-param-state
yarn install

# React + arktype (port 3000)
yarn dev:react

# React + Zod (port 3002)
yarn dev:react-zod

# Next.js with SSR (port 3001)
yarn dev:next
```

| Example | Schema Library | SSR | Port |
|---------|---------------|-----|------|
| `examples/react-app-arktype` | arktype | No | 3000 |
| `examples/react-app-zod` | Zod | No | 3002 |
| `examples/nextjs-app` | arktype | Yes | 3001 |

The Next.js example uses `parseParam` on the server to pre-render the table with the correct data based on URL params, then hydrates with `useSearchParamState` on the client for interactive updates.

## Project Structure

This repo is a Yarn workspaces monorepo:

```
packages/use-search-param-state/   # the library (published to npm)
examples/react-app-arktype/        # React + arktype example
examples/react-app-zod/            # React + Zod example
examples/nextjs-app/               # Next.js App Router example
```

Only `packages/use-search-param-state` is published. Example apps are private workspaces.

## License

MIT
