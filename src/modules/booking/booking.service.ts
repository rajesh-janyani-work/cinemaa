import { v4 as uuid } from "uuid";
import { Booking } from "../../models/booking.model";
import { Show } from "../../models/show.model";
import { AppError } from "../../middlewares/error.middleware";
import { CreateBookingInput } from "./booking.schema";


export const createBooking = async (userId: string, input: CreateBookingInput) => {
    const show = await Show.findById(input.showId);
    if (!show || !show.isActive) {
        throw new AppError(404, "Show not found");
    }

    // Check if the requested seats are available
    const requestedSeats = input.seats;
    for (const seatNumber of requestedSeats) {
        const seat = show.seats.find(s => s.seatNumber === seatNumber);
        if (!seat) {
            throw new AppError(400, `Seat ${seatNumber} is not available for this show`);
        }
        if(seat.status === 'BOOKED') {
            throw new AppError(400, `Seat ${seatNumber} is already booked`);
        }
    }


    // mark the requested seats as booked
    for (const seatNumber of requestedSeats) {
        const seat = show.seats.find(s => s.seatNumber === seatNumber);
        if (seat) {
            seat.status = 'BOOKED';
        }
    }

    await show.save();

    const totalPrice = requestedSeats.length * show.price;
    const bookingReference = `BK-${uuid().slice(0, 8).toUpperCase()}`;

    const booking = await Booking.create({
        userId,
        showId: input.showId,
        seats: requestedSeats,
        totalPrice,
        bookingReference,
    });

    return booking;
}


export const cancelBooking = async (bookingId: string, userId: string) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError(404, "Booking not found");
    if (booking.userId.toString() !== userId) throw new AppError(403, "Access denied");
    if (booking.status === "CANCELLED") throw new AppError(400, "Booking is already cancelled");

    // free up the seats in the show
    const show = await Show.findById(booking.showId);
    if(show) {
        for (const seatNumber of booking.seats) {
            const seat = show.seats.find(s => s.seatNumber === seatNumber);
            if (seat) {
                seat.status = 'AVAILABLE';
            }
        }
        await show.save();
    };

    booking.status = "CANCELLED";
    await booking.save();
    return booking;
}

export const getMyBookings = async (userId: string) => {
    return await Booking.find({ userId }).populate('showId').sort({ createdAt: -1 });
}

export const getAllBookings = async () => {
    return Booking.find().populate("showId").populate("userId", "username email").sort({createdAt: -1})
}

export const getBookingById = async (bookingId: string, userId: string) => {
    const booking = await Booking.findById(bookingId).populate("showId");
    if (!booking) throw new AppError(404, "Booking not found");
    if (booking.userId.toString() !== userId) throw new AppError(403, "Access denied");
    return booking;
};

