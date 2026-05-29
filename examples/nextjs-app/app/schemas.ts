import { type } from 'arktype';
import { categories, DEFAULT_PAGINATION } from './data';

export const searchSchema = type('string');

export const categorySchema = type.enumerated('all', ...categories);

export const paginationSchema = type('string.json.parse').pipe(
  type({
    pageIndex: type('number.integer >= 0').default(DEFAULT_PAGINATION.pageIndex),
    pageSize: type('number.integer > 0').default(DEFAULT_PAGINATION.pageSize),
  }),
);

export const sortingSchema = type('string.json.parse').pipe(
  type({
    desc: 'boolean',
    id: 'string',
  }).array(),
);
