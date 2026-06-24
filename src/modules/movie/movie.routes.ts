import { Router } from "express";
import * as MovieController from "./movie.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/movies:
 *   get:
 *     tags: [Movies]
 *     summary: Get all active movies
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by title
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *         description: Filter by genre (e.g. Action)
 *       - in: query
 *         name: language
 *         schema: { type: string }
 *         description: Filter by language (e.g. English)
 *     responses:
 *       200:
 *         description: List of movies
 */
router.get("/", MovieController.getAllMovies);

/**
 * @openapi
 * /api/movies/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: Get a movie by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie retrieved successfully
 *       404:
 *         description: Movie not found
 */
router.get("/:id", MovieController.getMovieById);

/**
 * @openapi
 * /api/movies:
 *   post:
 *     tags: [Movies]
 *     summary: Create a new movie (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, genre, language, duration, releaseDate, posterUrl]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *               language:
 *                 type: string
 *               duration:
 *                 type: number
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               posterUrl:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       403:
 *         description: Admins only
 */
router.post("/", authenticate, requireAdmin, MovieController.createMovie);

/**
 * @openapi
 * /api/movies/{id}:
 *   put:
 *     tags: [Movies]
 *     summary: Update a movie (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *               language:
 *                 type: string
 *               duration:
 *                 type: number
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               posterUrl:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       403:
 *         description: Admins only
 *       404:
 *         description: Movie not found
 */
router.put("/:id", authenticate, requireAdmin, MovieController.updateMovie);

/**
 * @openapi
 * /api/movies/{id}:
 *   delete:
 *     tags: [Movies]
 *     summary: Soft delete a movie (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       403:
 *         description: Admins only
 *       404:
 *         description: Movie not found
 */
router.delete("/:id", authenticate, requireAdmin, MovieController.deleteMovie);

export default router;
