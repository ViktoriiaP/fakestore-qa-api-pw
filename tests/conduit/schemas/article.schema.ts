import { z } from "zod";

export const AuthorSchema = z.object({
  username: z.string().min(1),
  bio: z.string().nullable().optional(),
  image: z.string().nullable(),
  following: z.boolean(),
});

export const ArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  tagList: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  favorited: z.boolean(),
  favoritesCount: z.number().int().nonnegative(),
  author: AuthorSchema,
});

export const ArticleResponseSchema = z.object({
  article: ArticleSchema,
});

export const ArticlesResponseSchema = z.object({
  articles: z.array(ArticleSchema),
  articlesCount: z.number().int().nonnegative(),
});

export const TagsResponseSchema = z.object({
  tags: z.array(z.string()),
});

export const UserSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  username: z.string().min(1),
  bio: z.string().nullable(),
  image: z.string().nullable(),
});

export const UserResponseSchema = z.object({
  user: UserSchema,
});
