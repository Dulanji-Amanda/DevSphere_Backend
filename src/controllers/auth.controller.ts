import { Request, Response } from "express"
import { IUSER, Role, User } from "../models/user.model"
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "../utils/tokens"
import { AUthRequest } from "../middleware/auth"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstname, lastname } = req.body

    // left email form model, right side data varible
    //   User.findOne({ email: email })
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email exists" })
    }

    const hash = await bcrypt.hash(password, 10)

    //   new User()
    const user = await User.create({
      email,
      password: hash,
      firstname,
      lastname,
      roles: [Role.USER]
    })

    res.status(201).json({
      message: "User registed",
      data: { email: user.email, roles: user.roles }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal; server error"
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const existingUser = (await User.findOne({ email })) as IUSER | null
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const valid = await bcrypt.compare(password, existingUser.password)
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const accessToken = signAccessToken(existingUser)
    const refreshToken = signRefreshToken(existingUser)

    res.status(200).json({
      message: "success",
      data: {
        email: existingUser.email,
        roles: existingUser.roles,
        accessToken,
        refreshToken
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal; server error"
    })
  }
}

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email exists" })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
      email,
      password: hash,
      roles: [Role.ADMIN]
    })

    res.status(201).json({
      message: "Admin registed",
      data: { email: user.email, roles: user.roles }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

export const getMyProfile = async (req: AUthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  const user = await User.findById(req.user.sub).select("-password")

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    })
  }

  const { email, roles, _id, firstname, lastname } = user as IUSER

  res.status(200).json({
    message: "ok",
    data: { id: _id, email, firstname, lastname, roles }
  })
}

export const updateMyProfile = async (req: AUthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  try {
    const { email, firstname, lastname, currentPassword, newPassword } = req.body as {
      email?: string
      firstname?: string
      lastname?: string
      currentPassword?: string
      newPassword?: string
    }
    const user = await User.findById(req.user.sub)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    if (email) user.email = email
    if (firstname) (user as any).firstname = firstname
    if (lastname) (user as any).lastname = lastname

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" })
      }
      const matches = await bcrypt.compare(currentPassword, user.password)
      if (!matches) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: "New password must be at least 8 characters" })
      }
      user.password = await bcrypt.hash(newPassword, 10)
    }
    await user.save()
    const { roles, _id, firstname: savedFirstName, lastname: savedLastName } = user as IUSER
    return res.status(200).json({
      message: "updated",
      data: {
        id: _id,
        email: user.email,
        firstname: savedFirstName,
        lastname: savedLastName,
        roles
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ message: "Token required" })
    }

    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload & {
      sub: string
    }
    const user = await User.findById(payload.sub)
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" })
    }
    const accessToken = signAccessToken(user)

    res.status(200).json({
      accessToken
    })
  } catch (err) {
    console.error(err)
    res.status(403).json({ message: "Invalid or expire token" })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string }
    // Intentionally respond with a generic message to avoid user enumeration
    if (!email) {
      return res.status(200).json({
        message:
          "If an account exists for this email, a reset link has been sent."
      })
    }

    // Here you would normally generate a token and send an email.
    // This is a placeholder implementation to satisfy the frontend request.
    return res.status(200).json({
      message:
        "If an account exists for this email, a reset link has been sent."
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}
