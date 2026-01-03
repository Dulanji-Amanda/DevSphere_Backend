import { Router } from "express"
import {
  getMyProfile,
  updateMyProfile,
  login,
  refreshToken,
  registerAdmin,
  registerUser,
  forgotPassword,
  verifyOtp,
  resetPassword
} from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { Role } from "../models/user.model"

const router = Router()

// register (only USER) 
router.post("/register", registerUser)

// login 
router.post("/login", login)

router.post("/refresh", refreshToken)

// forgot password  
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtp)
// reset password 
router.post("/reset-password", resetPassword)

// register (ADMIN)
router.post(
  "/admin/register",
  authenticate,
  requireRole([Role.ADMIN]),
  registerAdmin
)

// me - Admin or User both
router.get("/me", authenticate, getMyProfile)
router.put("/me", authenticate, updateMyProfile)

// router.get("/test", authenticate, () => {})

export default router
