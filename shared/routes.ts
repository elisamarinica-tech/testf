import { z } from 'zod';
import { insertFamilySchema, insertTrackerSchema, insertTrackerEntrySchema, families, trackers, trackerEntries } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  families: {
    list: {
      method: 'GET' as const,
      path: '/api/families' as const,
      responses: {
        200: z.array(z.custom<typeof families.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/families' as const,
      input: insertFamilySchema,
      responses: {
        201: z.custom<typeof families.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/families/:id' as const,
      input: insertFamilySchema.partial(),
      responses: {
        200: z.custom<typeof families.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/families/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  trackers: {
    list: {
      method: 'GET' as const,
      path: '/api/trackers' as const,
      responses: {
        200: z.array(z.custom<typeof trackers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trackers' as const,
      input: insertTrackerSchema,
      responses: {
        201: z.custom<typeof trackers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/trackers/:id' as const,
      input: insertTrackerSchema.partial(),
      responses: {
        200: z.custom<typeof trackers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: { 
      method: 'DELETE' as const,
      path: '/api/trackers/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  trackerEntries: {
    list: {
      method: 'GET' as const,
      path: '/api/tracker-entries' as const,
      input: z.object({
        date: z.string().optional(), // YYYY-MM-DD
        month: z.string().optional(), // YYYY-MM
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof trackerEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tracker-entries' as const,
      input: insertTrackerEntrySchema,
      responses: {
        201: z.custom<typeof trackerEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tracker-entries/:id' as const,
      input: insertTrackerEntrySchema.partial(),
      responses: {
        200: z.custom<typeof trackerEntries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tracker-entries/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type FamilyResponse = z.infer<typeof api.families.create.responses[201]>;
export type TrackerResponse = z.infer<typeof api.trackers.create.responses[201]>;
export type TrackerEntryResponse = z.infer<typeof api.trackerEntries.create.responses[201]>;
