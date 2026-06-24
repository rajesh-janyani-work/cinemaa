import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../middlewares/error.middleware";
import { createBookingSchema } from "./booking.schema";
import * as BookingService from "./booking.service";

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = createBookingSchema.parse(req.body);
    const booking = await BookingService.createBooking(req.userId!, data);
    return res.status(201).json({
        status: "success",
        message: "Booking created successfully",
        data: { booking },
    });
});

export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const bookings = await BookingService.getMyBookings(req.userId!);
    return res.status(200).json({
        status: "success",
        message: "Bookings retrieved successfully",
        data: { bookings },
    });
});

export const getBookingById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const booking = await BookingService.getBookingById(req.params.id, req.userId!);
    return res.status(200).json({
        status: "success",
        message: "Booking retrieved successfully",
        data: { booking },
    });
});

export const cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const booking = await BookingService.cancelBooking(req.params.id, req.userId!);
    return res.status(200).json({
        status: "success",
        message: "Booking cancelled successfully",
        data: { booking },
    });
});

export const getAllBookings = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const bookings = await BookingService.getAllBookings();
    return res.status(200).json({
        status: "success",
        message: "All bookings retrieved successfully",
        data: { bookings },
    });
});
