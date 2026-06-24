import { Show, Seat } from "../../models/show.model";
import { Movie } from "../../models/movie.model";
import { CreateShowInput, UpdateShowInput } from "./show.schema";
import { AppError } from "../../middlewares/error.middleware";
import { Types } from "mongoose";

// Layout -> flat seat list. 
const generatSeats = (rows: number, seatsPerRow: number) => {
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

    const seats = generatSeats(input.layout.rows, input.layout.seatsPerRow);

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

// List active shows, optionally filtered by movie
export const getShows = async (movieId?: string) => {
    const filter: Record<string, unknown> = { isActive: true};

    if(movieId) {
        filter.movieId = new Types.ObjectId(movieId)
    }
    
    const shows = await Show.find(filter).sort({ startTime: 1}).populate("movieId", "title");
    return shows;
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



