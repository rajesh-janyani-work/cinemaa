import { z } from "zod";

export const createMovieSchema = z.object({
    title: z.string().min(1, "Title is required").trim(),
    description: z.string().min(1, "Description is required").trim(),
    genre: z.array(z.string().min(1, "Genre cannot be empty")).min(1, "At least one genre is required"),
    language: z.string().min(1, "Language is required").trim(),
    duration: z.number().positive("Duration must be a positive number"),
    releaseDate: z.coerce.date(),
    posterUrl: z.string().url("Invalid poster URL"),
    rating: z.number().min(0, "Rating must be at least 0").max(10, "Rating cannot exceed 10"),
});

export const updateMovieSchema = createMovieSchema.partial().refine((data) => Object.keys(data).length > 0, "At least one field must be provided for update");

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;