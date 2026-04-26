import { z } from 'zod';

const snapshotSchema = z.object({
  meta: z.record(z.string(), z.unknown()).optional(),
  theme: z.unknown().nullable().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  access: z.unknown().optional(),
  pages: z.array(z.unknown()).optional(),
  logic: z.unknown().optional(),
  workflow: z.unknown().nullable().optional(),
});

export const createFormTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
    sharedWith: z.array(z.string()).optional(),
    snapshot: snapshotSchema,
  }),
});

export const updateFormTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
    sharedWith: z.array(z.string()).optional(),
    snapshot: snapshotSchema.optional(),
  }),
});
