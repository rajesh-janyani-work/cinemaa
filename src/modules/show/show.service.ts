import { Show, Seat } from "../../models/show.model";
import { Movie } from "../../models/movie.model";
import { CreateShowInput, UpdateShowInput } from "./show.schema";
import { AppError } from "../../middlewares/error.middleware";
import { Types } from "mongoose";

// Layout -> flat seat list. 
const generateSeats = (rows: number, seatsPerRow: number) => {
    const seats: Seat[] = [];
    for (let r = 0; r < rows; r++){
        const rowLabel = String.fromCharCode(65 +r);
        for (let n=0; n <= seatsPerRow; n++){
            seats.push({seatNumber: `${rowLabel}-${n}`, status: "AVAILABLE"})
        }
    }
    return seats;
}

// create show 
export const createShow = async (input: CreateShowInput) => {
    const movie = await Movie.findById(input.movieId);
    if(!movie){
        throw new AppError(404, "Movie not found");
    }

    const seats = generateSeats(input.layout.rows, input.layout.seatsPerRow);

    const show = await Show.create({
        movieId: input.movieId,
        screenName: input.screenName,
        startTime: input.startTime,
        price: input.price,
        seats,
        isActive: true
    });

    return show;

}

// List active shows, optionally filtered by movie and/or date
export const getShows = async (movieId?: string, date?: string, page = 1, limit = 20) => {
    const filter: Record<string, unknown> = { isActive: true };

    if (movieId) {
        filter.movieId = new Types.ObjectId(movieId);
    }

    if (date) {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);
        filter.startTime = { $gte: start, $lte: end };
    }

    const skip = (page - 1) * limit;

    const [shows, total] = await Promise.all([
        Show.find(filter).skip(skip).limit(limit).sort({ startTime: 1 }).populate("movieId", "title"),
        Show.countDocuments(filter),
    ]);

    return { shows, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
}


// One show with full seat map
export const getShowById = async (showId: string) => {
    const show = await Show.findById(showId).populate("movieId", "title language")
    if (!show) {
        throw new AppError(404, "Show not found");
    }
    return show;
}

// Just the seats
export const getShowSeats = async (showId: string ) => {
    const show = await Show.findById(showId).select("seats")
    if(!show) throw new AppError(404, "Show not found")
    return show.seats;
}


// Update mutable fields 
export const updateShow = async (showId: string, input: UpdateShowInput) => {
    const show = await Show.findByIdAndUpdate(showId, input, {
        new: true,
        runValidators: true,
    });
    if(!show) throw new AppError(404, "show not found")

    return show;
}


// Soft Delete 
export const deleteShow = async (showId: string) => {
    const show = await Show.findByIdAndUpdate(showId, { isActive: false});
    if(!show) throw new AppError(404, "Show not found")

    return show;
}



