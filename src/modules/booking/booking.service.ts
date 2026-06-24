import { v4 as uuid } from "uuid";
import { Booking } from "../../models/booking.model";
import { Show } from "../../models/show.model";
import { AppError } from "../../middlewares/error.middleware";
import { CreateBookingInput } from "./booking.schema";
import mongoose from "mongoose";


export const createBooking = async (userId: string, input: CreateBookingInput) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // .session(session) tells MongoDB: this read is part of the transaction
        const show = await Show.findById(input.showId).session(session);
        if (!show || !show.isActive) throw new AppError(404, "Show not found");

        const requestedSeats = input.seats;

        for (const seatNumber of requestedSeats) {
            const seat = show.seats.find(s => s.seatNumber === seatNumber);
            if (!seat) throw new AppError(400, `Seat ${seatNumber} does not exist`);
            if (seat.status === "BOOKED") throw new AppError(409, `Seat ${seatNumber} is already booked`);
        }

        for (const seatNumber of requestedSeats) {
            const seat = show.seats.find(s => s.seatNumber === seatNumber)!;
            seat.status = "BOOKED";
        }

        // { session } tells MongoDB: this write is part of the transaction
        await show.save({ session });

        const totalPrice = requestedSeats.length * show.price;
        const bookingReference = `BK-${uuid().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

        // Booking.create with array + session — required syntax for transactions
        const [booking] = await Booking.create([{
            userId,
            showId: input.showId,
            seats: requestedSeats,
            totalPrice,
            bookingReference,
        }], { session });

        // All operations succeeded — commit (make permanent)
        await session.commitTransaction();
        return booking;

    } catch (error) {
        // Anything failed — undo everything
        await session.abortTransaction();
        throw error;
    } finally {
        // Always clean up the session whether success or failure
        session.endSession();
    }
};



export const cancelBooking = async (bookingId: string, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) throw new AppError(404, "Booking not found");
        if (booking.userId.toString() !== userId) throw new AppError(403, "Access denied");
        if (booking.status === "CANCELLED") throw new AppError(400, "Booking is already cancelled");

        const show = await Show.findById(booking.showId).session(session);
        if (show) {
            for (const seatNumber of booking.seats) {
                const seat = show.seats.find(s => s.seatNumber === seatNumber);
                if (seat) seat.status = "AVAILABLE";
            }
            await show.save({ session });
        }

        booking.status = "CANCELLED";
        await booking.save({ session });

        await session.commitTransaction();
        return booking;

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getMyBookings = async (userId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
        Booking.find({ userId }).populate('showId', '-seats').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Booking.countDocuments({ userId }),
    ]);
    return { bookings, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
}

export const getAllBookings = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
        Booking.find().populate("showId", "-seats").populate("userId", "username email").sort({ createdAt: -1 }).skip(skip).limit(limit),
        Booking.countDocuments(),
    ]);
    return { bookings, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
};

export const getBookingById = async (bookingId: string, userId: string) => {
    const booking = await Booking.findById(bookingId).populate("showId", "-seats");
    if (!booking) throw new AppError(404, "Booking not found");
    if (booking.userId.toString() !== userId) throw new AppError(403, "Access denied");
    return booking;
};

