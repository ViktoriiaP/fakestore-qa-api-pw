import * as z from "zod";
import { id } from "zod/locales";
const json = [
  {
    id: 4,
    title: "Handmade Fresh Table",
    slug: "handmade-fresh-table",
    price: 687,
    description: "Andy shoes are designed to keeping in...",
    category: {
      id: 5,
      name: "Others",
      image: "https://placehold.co/600x400",
      slug: "others",
    },
    images: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
    ],
  },
  // ...
];

const Category = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  image: z.string().optional(),
  slug: z.string().optional(),
});

export const Products = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    price: z.number(),
    description: z.string(),
    category: Category,
    images: z.array(z.string()).optional(),
  }),
);
const data = Products.safeParse(json);
console.log(data);
