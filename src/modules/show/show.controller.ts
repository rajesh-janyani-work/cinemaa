import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as ShowService from "./show.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { createShowSchema, updateShowSchema } from "./show.schema";

export const createShow = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createShowSchema.parse(req.body);
  const show = await ShowService.createShow(data);
  return res.status(201).json({
    status: "success",
    message: "Show created successfully",
    data: { show },
  });
});

export const getShows = asyncHandler(async (req: Request, res: Response) => {
  // req.query values are string | string[] | undefined — guard the type.
  const movieId = typeof req.query.movieId === "string" ? req.query.movieId : undefined;
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await ShowService.getShows(movieId, date, page, limit);
  return res.status(200).json({
    status: "success",
    message: "Shows retrieved successfully",
    data: result,
  });
});

export const getShowById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const show = await ShowService.getShowById(id);
  return res.status(200).json({
    status: "success",
    message: "Show retrieved successfully",
    data: { show },
  });
});

export const getShowSeats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const seats = await ShowService.getShowSeats(id);
  return res.status(200).json({
    status: "success",
    message: "Seats retrieved successfully",
    data: { seats },
  });
});

export const updateShow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateShowSchema.parse(req.body);
  const show = await ShowService.updateShow(id, data);
  return res.status(200).json({
    status: "success",
    message: "Show updated successfully",
    data: { show },
  });
});

export const deleteShow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ShowService.deleteShow(id);
  return res.status(200).json({
    status: "success",
    message: "Show deleted successfully",
    data: null,
  });
});
