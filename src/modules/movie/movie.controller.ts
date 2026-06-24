import {Request, Response} from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as MovieService from "./movie.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { createMovieSchema, updateMovieSchema } from "./movie.schema";

// Create a new movie controller
export const createMovie = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = createMovieSchema.parse(req.body);
    const movie = await MovieService.createMovie(data);
    return res.status(201).json({
        status: "success",
        message: "Movie created successfully",
        data: {
            movie
        }
    });
})

// Get all active movies controller
export const getAllMovies = asyncHandler(async (req: Request, res: Response) => {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const genre = typeof req.query.genre === "string" ? req.query.genre : undefined;
    const language = typeof req.query.language === "string" ? req.query.language : undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await MovieService.getAllMovies({ search, genre, language, page, limit });
    return res.status(200).json({
        status: "success",
        message: "Movies retrieved successfully",
        data: result,
    });
})

// Get a movie by ID controller
export const getMovieById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const movie = await MovieService.getMovieById(id);
    return res.status(200).json({
        status: "success",
        message: "Movie retrieved successfully",
        data: {
            movie
        }
    });
})

// Update a movie by ID controller
export const updateMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateMovieSchema.parse(req.body);
    const movie = await MovieService.updateMovie(id, data);
    return res.status(200).json({
        status: "success",
        message: "Movie updated successfully",
        data: {
            movie
        }
    });
})

// Delete a movie by ID controller (soft delete)
export const deleteMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await MovieService.deleteMovie(id);
    return res.status(200).json({
        status: "success",
        message: "Movie deleted successfully",
        data: null
    });
})