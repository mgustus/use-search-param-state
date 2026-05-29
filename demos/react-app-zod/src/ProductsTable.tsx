import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { useSearchParamState } from 'use-search-param-state';
import {
  categories,
  DEFAULT_PAGINATION,
  getFilteredProducts,
  getPaginatedProducts,
  getSortedProducts,
  products,
  type Product,
  type PaginationState,
  type SortingState,
} from './data';
import {
  categorySchema,
  paginationSchema,
  searchSchema,
  sortingSchema,
} from './schemas';

const columns: ColumnDef<Product>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'name', header: 'Name', size: 250 },
  { accessorKey: 'category', header: 'Category', size: 120 },
  {
    accessorKey: 'price',
    header: 'Price',
    size: 100,
    cell: ({ getValue }) => `$${(getValue<number>()).toFixed(2)}`,
  },
  { accessorKey: 'stock', header: 'Stock', size: 80 },
];

export function ProductsTable() {
  const [search, setSearch] = useSearchParamState('search', searchSchema, '');
  const [category, setCategory] = useSearchParamState('category', categorySchema, 'all' as const);
  const [pagination, setPagination] = useSearchParamState('pagination', paginationSchema, DEFAULT_PAGINATION);
  const [sorting, setSorting] = useSearchParamState('sorting', sortingSchema, [] as SortingState[]);

  const filtered = getFilteredProducts(products, search, category);
  const sorted = getSortedProducts(filtered, sorting);
  const paginated = getPaginatedProducts(sorted, pagination);
  const pageCount = Math.ceil(filtered.length / pagination.pageSize);

  const table = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next as SortingState[]);
      setPagination({ ...pagination, pageIndex: 0 });
    },
  });

  return (
    <div className="table-container">
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination({ ...pagination, pageIndex: 0 });
          }}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPagination({ ...pagination, pageIndex: 0 });
          }}
          className="category-select"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                  className={header.column.getCanSort() ? 'sortable' : ''}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-row">
                No products found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <div className="pagination-info">
          Showing {filtered.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1}
          –{Math.min((pagination.pageIndex + 1) * pagination.pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => setPagination({ ...pagination, pageIndex: 0 })}
            disabled={pagination.pageIndex === 0}
          >
            ««
          </button>
          <button
            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
            disabled={pagination.pageIndex === 0}
          >
            «
          </button>
          <span className="page-indicator">
            Page {pagination.pageIndex + 1} of {pageCount || 1}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
            disabled={pagination.pageIndex >= pageCount - 1}
          >
            »
          </button>
          <button
            onClick={() => setPagination({ ...pagination, pageIndex: pageCount - 1 })}
            disabled={pagination.pageIndex >= pageCount - 1}
          >
            »»
          </button>
          <select
            value={pagination.pageSize}
            onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
            className="page-size-select"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
