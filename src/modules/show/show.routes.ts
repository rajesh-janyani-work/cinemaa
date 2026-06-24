import { Router } from "express";
import * as ShowController from "./show.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/shows:
 *   get:
 *     tags: [Shows]
 *     summary: List active shows (optionally filtered by ?movieId=)
 *     parameters:
 *       - in: query
 *         name: movieId
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of shows }
 */
router.get("/", ShowController.getShows);

/**
 * @openapi
 * /api/shows/{id}/seats:
 *   get:
 *     tags: [Shows]
 *     summary: Get the seat map / availability for a show
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Seat list }
 *       404: { description: Show not found }
 */
router.get("/:id/seats", ShowController.getShowSeats);

/**
 * @openapi
 * /api/shows/{id}:
 *   get:
 *     tags: [Shows]
 *     summary: Get one show with its full seat map
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Show retrieved }
 *       404: { description: Show not found }
 */
router.get("/:id", ShowController.getShowById);

/**
 * @openapi
 * /api/shows:
 *   post:
 *     tags: [Shows]
 *     summary: Create a show (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movieId, screenName, startTime, price, layout]
 *             properties:
 *               movieId: { type: string }
 *               screenName: { type: string }
 *               startTime: { type: string, format: date-time }
 *               price: { type: number }
 *               layout:
 *                 type: object
 *                 properties:
 *                   rows: { type: number }
 *                   seatsPerRow: { type: number }
 *     responses:
 *       201: { description: Show created }
 *       404: { description: Movie not found }
 */
router.post("/", authenticate, requireAdmin, ShowController.createShow);

/**
 * @openapi
 * /api/shows/{id}:
 *   put:
 *     tags: [Shows]
 *     summary: Update a show (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               screenName: { type: string }
 *               startTime: { type: string, format: date-time }
 *               price: { type: number }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Show updated }
 *       404: { description: Show not found }
 */
router.put("/:id", authenticate, requireAdmin, ShowController.updateShow);

/**
 * @openapi
 * /api/shows/{id}:
 *   delete:
 *     tags: [Shows]
 *     summary: Soft-delete a show (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Show deleted }
 *       404: { description: Show not found }
 */
router.delete("/:id", authenticate, requireAdmin, ShowController.deleteShow);

export default router;
