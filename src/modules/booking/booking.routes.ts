import { Router } from "express";
import * as BookingController from "./booking.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Book seats for a show
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [showId, seats]
 *             properties:
 *               showId:
 *                 type: string
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A1", "A2"]
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Seat not available
 *       404:
 *         description: Show not found
 */
router.post("/", authenticate, BookingController.createBooking);

/**
 * @openapi
 * /api/bookings/my:
 *   get:
 *     tags: [Bookings]
 *     summary: Get my bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 */
router.get("/my", authenticate, BookingController.getMyBookings);

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get a booking by ID
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
 *         description: Booking retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.get("/:id", authenticate, BookingController.getBookingById);

/**
 * @openapi
 * /api/bookings/{id}/cancel:
 *   patch:
 *     tags: [Bookings]
 *     summary: Cancel a booking
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
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking already cancelled
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.patch("/:id/cancel", authenticate, BookingController.cancelBooking);

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bookings
 *       403:
 *         description: Admins only
 */
router.get("/", authenticate, requireAdmin, BookingController.getAllBookings);

export default router;
