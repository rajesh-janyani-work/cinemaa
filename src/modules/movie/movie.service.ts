import { Movie } from "../../models/movie.model";
import { AppError } from "../../middlewares/error.middleware";
import { CreateMovieInput, UpdateMovieInput } from "./movie.schema";

// Create a new movie service
export const createMovie = async (input : CreateMovieInput) => {
    const movie = await Movie.create(input);
    return movie;
};

export interface MovieFilters {
    search?: string;
    genre?: string;
    language?: string;
    page?: number;
    limit?: number
}

// Get all active movies service
export const getAllMovies = async (filters: MovieFilters = {}) => {
    const query: Record<string, unknown> = { isActive: true };

    if (filters.search) {
        query.title = { $regex: filters.search, $options: "i" };
    }
    if (filters.genre) {
        query.genre = { $in: [filters.genre] };
    }
    if (filters.language) {
        query.language = { $regex: `^${filters.language}$`, $options: "i" };
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
        Movie.find(query).skip(skip).limit(limit),
        Movie.countDocuments(query),
    ])

    return { movies, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
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