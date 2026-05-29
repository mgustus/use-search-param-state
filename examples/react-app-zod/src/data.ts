export const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'] as const;
export type Category = (typeof categories)[number];

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: number;
}

export const products: Product[] = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99, stock: 150 },
  { id: 2, name: 'Bluetooth Speaker', category: 'Electronics', price: 49.99, stock: 200 },
  { id: 3, name: 'USB-C Hub', category: 'Electronics', price: 34.99, stock: 300 },
  { id: 4, name: 'Mechanical Keyboard', category: 'Electronics', price: 129.99, stock: 75 },
  { id: 5, name: '4K Monitor', category: 'Electronics', price: 399.99, stock: 40 },
  { id: 6, name: 'Webcam HD', category: 'Electronics', price: 59.99, stock: 180 },
  { id: 7, name: 'Laptop Stand', category: 'Electronics', price: 44.99, stock: 220 },
  { id: 8, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 350 },
  { id: 9, name: 'Cotton T-Shirt', category: 'Clothing', price: 19.99, stock: 500 },
  { id: 10, name: 'Denim Jeans', category: 'Clothing', price: 59.99, stock: 200 },
  { id: 11, name: 'Running Shoes', category: 'Clothing', price: 89.99, stock: 150 },
  { id: 12, name: 'Winter Jacket', category: 'Clothing', price: 149.99, stock: 80 },
  { id: 13, name: 'Wool Sweater', category: 'Clothing', price: 69.99, stock: 120 },
  { id: 14, name: 'Baseball Cap', category: 'Clothing', price: 24.99, stock: 300 },
  { id: 15, name: 'Leather Belt', category: 'Clothing', price: 34.99, stock: 250 },
  { id: 16, name: 'Silk Scarf', category: 'Clothing', price: 44.99, stock: 100 },
  { id: 17, name: 'TypeScript Handbook', category: 'Books', price: 39.99, stock: 400 },
  { id: 18, name: 'React Patterns', category: 'Books', price: 34.99, stock: 350 },
  { id: 19, name: 'System Design', category: 'Books', price: 49.99, stock: 200 },
  { id: 20, name: 'Clean Code', category: 'Books', price: 29.99, stock: 500 },
  { id: 21, name: 'JavaScript Definitive Guide', category: 'Books', price: 44.99, stock: 300 },
  { id: 22, name: 'CSS in Depth', category: 'Books', price: 39.99, stock: 250 },
  { id: 23, name: 'Node.js in Action', category: 'Books', price: 34.99, stock: 180 },
  { id: 24, name: 'GraphQL in Action', category: 'Books', price: 37.99, stock: 150 },
  { id: 25, name: 'Desk Lamp', category: 'Home', price: 39.99, stock: 200 },
  { id: 26, name: 'Coffee Maker', category: 'Home', price: 89.99, stock: 100 },
  { id: 27, name: 'Plant Pot Set', category: 'Home', price: 24.99, stock: 400 },
  { id: 28, name: 'Throw Blanket', category: 'Home', price: 49.99, stock: 150 },
  { id: 29, name: 'Wall Clock', category: 'Home', price: 34.99, stock: 250 },
  { id: 30, name: 'Bookshelf', category: 'Home', price: 119.99, stock: 60 },
  { id: 31, name: 'Scented Candle Set', category: 'Home', price: 19.99, stock: 500 },
  { id: 32, name: 'Kitchen Scale', category: 'Home', price: 27.99, stock: 300 },
  { id: 33, name: 'Yoga Mat', category: 'Sports', price: 29.99, stock: 300 },
  { id: 34, name: 'Dumbbells Set', category: 'Sports', price: 79.99, stock: 100 },
  { id: 35, name: 'Jump Rope', category: 'Sports', price: 14.99, stock: 400 },
  { id: 36, name: 'Resistance Bands', category: 'Sports', price: 19.99, stock: 350 },
  { id: 37, name: 'Water Bottle', category: 'Sports', price: 12.99, stock: 600 },
  { id: 38, name: 'Tennis Racket', category: 'Sports', price: 69.99, stock: 80 },
  { id: 39, name: 'Basketball', category: 'Sports', price: 24.99, stock: 200 },
  { id: 40, name: 'Cycling Helmet', category: 'Sports', price: 54.99, stock: 120 },
];

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

export function getFilteredProducts(
  allProducts: Product[],
  search: string,
  category: string,
) {
  return allProducts.filter((p) => {
    const matchesSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });
}

export function getSortedProducts(filtered: Product[], sorting: SortingState[]) {
  if (!sorting.length) return filtered;
  const { id, desc } = sorting[0]!;
  return [...filtered].sort((a, b) => {
    const aVal = a[id as keyof Product];
    const bVal = b[id as keyof Product];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    return desc ? Number(bVal) - Number(aVal) : Number(aVal) - Number(bVal);
  });
}

export function getPaginatedProducts(
  sorted: Product[],
  pagination: PaginationState,
) {
  const start = pagination.pageIndex * pagination.pageSize;
  return sorted.slice(start, start + pagination.pageSize);
}
