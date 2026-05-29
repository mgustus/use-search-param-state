import { ProductsTable } from './ProductsTable';

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>useSearchParamState Example</h1>
        <p className="subtitle">
          React + Zod — Table state is stored in URL search params.
          Try changing filters, sorting, or pagination, then refresh the page.
        </p>
      </header>
      <main>
        <ProductsTable />
      </main>
      <footer>
        <p>
          Current URL: <code>{window.location.search || '(no params — defaults active)'}</code>
        </p>
      </footer>
    </div>
  );
}
