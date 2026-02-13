import { z } from 'zod';

/* ── Schemas para Filtros de Reportes ── */

export const searchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(5).max(100).default(10),
});

export type SearchParams = z.infer<typeof searchSchema>;

export const dateRangeSchema = searchSchema.extend({
  startDate: z.string().date().optional(),
  endDate:   z.string().date().optional(),
});

export const topProductsSchema = searchSchema.extend({
  limit: z.coerce.number().min(1).max(50).default(10).describe("Top N productos"),
  minVentas: z.coerce.number().min(0).optional(),
});

export const reportIdSchema = z.object({
  id: z.enum(['sales-category', 'top-products', 'customer-summary', 'order-status', 'daily-sales']),
});
