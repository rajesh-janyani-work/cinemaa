import mongoose, {Document, Schema} from "mongoose";

export interface MovieDocument extends Document {
    title: string;
    description: string;
    genre: string[];
    language: string;
    duration: number;
    releaseDate: Date;
    posterUrl: string;
    isActive: boolean;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}   

const movieSchema = new Schema<MovieDocument>({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    genre: {
        type: [String],
        required: true,
    },
    language: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    posterUrl: {
        type: String,
        required: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
    }
}, { timestamps: true });

export const Movie = mongoose.model<MovieDocument>("Movie", movieSchema);