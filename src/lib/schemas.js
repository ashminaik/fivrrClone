import { z } from 'zod';

const CATEGORIES = [
  'Web Development',
  'Design',
  'Marketing',
  'Writing',
  'Video',
  'Music',
  'Programming & Tech',
  'Graphics & Design',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Business & Finance',
  'Data & Analytics',
];

export const gigSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  price: z.coerce.number().min(5, 'Price must be at least 5'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Please select a category' }) }),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Rating is required').max(5),
  comment: z.string().optional(),
});
