import * as z from "zod";

export const SourceSchema = z.object({
  id: z.string().nullable(),
  name: z.string(),
});

export const ArticleSchema = z.object({
  source: SourceSchema,
  author: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string().url(),
  urlToImage: z.string().url().nullable(),
  publishedAt: z.string().datetime(),
  content: z.string().nullable(),
});

export const EverythingSuccessSchema = z.object({
  status: z.literal("ok"),
  totalResults: z.number().int().nonnegative(),
  articles: z.array(ArticleSchema),
});

export const EverythingErrorSchema = z.object({
  status: z.literal("error"),
  code: z.string(),
  message: z.string(),
});
