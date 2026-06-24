import mongoose, { Document, Schema } from "mongoose";

export type SeatStatus = "AVAILABLE" | "BOOKED";

export interface Seat {
    seatNumber: string;
    status: SeatStatus;
}

export interface ShowDocument extends Document {
    movieId: mongoose.Types.ObjectId;
    screenName: string;
    startTime: Date;
    price: number;
    seats: Seat[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Embedded seat subdocument. _id is disabled — seats are addressed by
// seatNumber (unique within a show), so per-seat ObjectIds add no value.
const seatSchema = new Schema<Seat>(
    {
        seatNumber: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["AVAILABLE", "BOOKED"],
            default: "AVAILABLE",
        },
    },
    { _id: false }
);

const showSchema = new Schema<ShowDocument>(
    {
        // Reference: a movie is shared across many shows and lives on its own.
        movieId: {
            type: Schema.Types.ObjectId,
            ref: "Movie",
            required: true,
        },
        screenName: {
            type: String,
            required: true,
            trim: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        // Embedded: seats are owned by exactly one show, always read with it,
        // and bounded in number — which also enables atomic, race-safe booking.
        seats: {
            type: [seatSchema],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Common query: shows for a movie, ordered by time.
showSchema.index({ movieId: 1, startTime: 1 });

export const Show = mongoose.model<ShowDocument>("Show", showSchema);
