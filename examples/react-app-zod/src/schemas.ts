import { z } from 'zod';
import { categories, DEFAULT_PAGINATION } from './data';

export const searchSchema = z.string();

export const categorySchema = z.enum(['all', ...categories]);

export const paginationSchema = z
  .string()
  .transform((s) => JSON.parse(s) as unknown)
  .pipe(
    z.object({
      pageIndex: z.number().int().min(0).default(DEFAULT_PAGINATION.pageIndex),
      pageSize: z.number().int().positive().default(DEFAULT_PAGINATION.pageSize),
    }),
  );

export const sortingSchema = z
  .string()
  .transform((s) => JSON.parse(s) as unknown)
  .pipe(
    z.array(
      z.object({
        desc: z.boolean(),
        id: z.string(),
      }),
    ),
  );
