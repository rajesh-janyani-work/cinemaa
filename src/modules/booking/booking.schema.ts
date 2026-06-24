import { z } from 'zod';

export const createBookingSchema = z.object({
    showId: z.string().min(1, 'Show ID is required'),
    seats: z.array(z.string().min(1, 'Seat ID is required')).min(1, 'At least one seat must be selected'),
})

export const cancelBookingSchema = z.object({
    id: z.string().min(1, 'Booking ID is required'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
