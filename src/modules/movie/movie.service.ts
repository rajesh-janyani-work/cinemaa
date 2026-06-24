import { Movie } from "../../models/movie.model";
import { AppError } from "../../middlewares/error.middleware";
import { CreateMovieInput, UpdateMovieInput } from "./movie.schema";

// Create a new movie service
export const createMovie = async (input : CreateMovieInput) => {
    const movie = await Movie.create(input);
    return movie;
};

// Get all active movies service
export const getAllMovies = async () => {
    const movies = await Movie.find({isActive: true});
    return movies;
}

// Get a movie by ID service
export const getMovieById = async (id: string) => {
    const movie = await Movie.findById(id);
    if(!movie) {
        throw new AppError(404, "Movie not found");
    }
    return movie;
}

// Update a movie by ID service
export const updateMovie = async (id: string, input: UpdateMovieInput) => {
    const movie = await Movie.findByIdAndUpdate(id, input, {new: true});
    if(!movie) {
        throw new AppError(404, "Movie not found");
    }
    return movie;
}

// Delete a movie by ID service (soft delete)
export const deleteMovie = async (id: string) => {
    const movie = await Movie.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if(!movie) {
        throw new AppError(404, "Movie not found");
    }
    return movie;
}