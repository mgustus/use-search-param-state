import { parseParam } from 'use-search-param-state/server';
import {
  DEFAULT_PAGINATION,
  getFilteredProducts,
  getPaginatedProducts,
  getSortedProducts,
  products,
  type SortingState,
} from './data';
import { ProductsTable } from './ProductsTable';
import {
  categorySchema,
  paginationSchema,
  searchSchema,
  sortingSchema,
} from './schemas';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;

  const search = parseParam(searchParams.search, searchSchema, '');
  const category = parseParam(searchParams.category, categorySchema, 'all');
  const pagination = parseParam(
    searchParams.pagination,
    paginationSchema,
    DEFAULT_PAGINATION,
  );
  const sorting = parseParam(
    searchParams.sorting,
    sortingSchema,
    [] as SortingState[],
  );

  const filtered = getFilteredProducts(products, search, category);
  const sorted = getSortedProducts(filtered, sorting);
  const paginated = getPaginatedProducts(sorted, pagination);

  return (
    <div className="app">
      <header>
        <h1>useSearchParamState Example</h1>
        <p className="subtitle">
          Next.js (App Router) + arktype — Server-side rendered initial data,
          client-side interactive updates. Table state lives in URL search params.
        </p>
        <div className="ssr-badge">
          SSR: {paginated.length} rows rendered on the server
          (page {pagination.pageIndex + 1}, {filtered.length} total matching)
        </div>
      </header>
      <main>
        <ProductsTable
          initialData={paginated}
          initialTotalCount={filtered.length}
        />
      </main>
    </div>
  );
}
