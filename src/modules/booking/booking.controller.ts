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
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await BookingService.getMyBookings(req.userId!, page, limit);
    return res.status(200).json({
        status: "success",
        message: "Bookings retrieved successfully",
        data: result,
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

export const getAllBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await BookingService.getAllBookings(page, limit);
    return res.status(200).json({
        status: "success",
        message: "All bookings retrieved successfully",
        data: result,
    });
});
