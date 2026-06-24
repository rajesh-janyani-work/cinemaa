import mongoose, { Document, Schema } from 'mongoose';

export interface BookingDocument extends Document {
    userId: mongoose.Types.ObjectId;
    showId: mongoose.Types.ObjectId;
    seats: string[];
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    bookingReference: string;
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    showId: {
        type: mongoose.Types.ObjectId,
        ref: 'Show',
        required: true,
    },
    seats: {
        type: [String],
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
        default: 'PENDING',
    },
    bookingReference: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

bookingSchema.index({ userId: 1 });
bookingSchema.index({ showId: 1 });

export const Booking = mongoose.model<BookingDocument>("Booking", bookingSchema);
