import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import sendEmailVerificationOTP from "../utils/sendEmailVerificationOTP.js";
import EmailVerificationModel from "../models/EmailVerification.js";
import generateTokens from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
// import transporter from "../config/emailConfig.js";
import pkg from "google-libphonenumber";
import setTokensCookies from "../utils/setTokensCookies.js";
import sgMail from "../config/emailConfig.js";
const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();

class UserController {
  // User Registration
  static userRegistration = async (req, res) => {
    try {
      const { name, number, email, password, password_confirmation } = req.body;
      const PhoneNumber = phoneUtil.parse(number);
      if (!phoneUtil.isValidNumber(PhoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number" });
      }
      // Check if all required fields are provided
      if (!name || !email || !password || !password_confirmation || !number) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are required" });
      }

      // Check if password and password_confirmation match
      if (password !== password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "Password and Confirm Password don't match",
        });
      }

      // Check if email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ status: "failed", message: "Email already exists" });
      }

      // Generate salt and hash password
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await new UserModel({
        name,
        number,
        email,
        password: hashedPassword,
      }).save();

      sendEmailVerificationOTP(req, newUser);

      // Send success response
      res.status(201).json({
        status: "success",
        message: "Registration Success",
        user: { id: newUser._id, email: newUser.email },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to Register, please try again later",
      });
    }
  };

  // User Email Verification
  static verifyEmail = async (req, res) => {
    try {
      // Extract request body parameters
      const { email, otp } = req.body;

      // Check if all required fields are provided
      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are required" });
      }

      const existingUser = await UserModel.findOne({ email });

      // Check if email doesn't exists
      if (!existingUser) {
        return res
          .status(404)
          .json({ status: "failed", message: "Email doesn't exists" });
      }

      // Check if email is already verified
      if (existingUser.is_verified) {
        return res
          .status(400)
          .json({ status: "failed", message: "Email is already verified" });
      }

      // Check if there is a matching email verification OTP
      const emailVerification = await EmailVerificationModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.is_verified) {
          await sendEmailVerificationOTP(req, existingUser);
          return res.status(400).json({
            status: "failed",
            message: "Invalid OTP, new OTP sent to your email",
          });
        }
        return res
          .status(400)
          .json({ status: "failed", message: "Invalid OTP" });
      }

      // Check if OTP is expired
      const currentTime = new Date();
      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({
          status: "failed",
          message: "OTP expired, new OTP sent to your email",
        });
      }

      // OTP is valid and not expired, mark email as verified
      existingUser.is_verified = true;
      await existingUser.save();

      // Delete email verification document
      await EmailVerificationModel.deleteMany({ userId: existingUser._id });
      return res
        .status(200)
        .json({ status: "success", message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to verify email, please try again later",
      });
    }
  };

  // User Login
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).json({
          status: "failed",
          message: "Email and password are required",
        });
      }
      // Find user by email
      const user = await UserModel.findOne({ email });

      // Check if user exists
      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "Invalid Email or Password" });
      }

      // Check if user exists
      if (!user.is_verified) {
        return res
          .status(401)
          .json({ status: "failed", message: "Your account is not verified" });
      }

      // Compare passwords / Check Password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ status: "failed", message: "Invalid email or password" });
      }

      // Generate tokens
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
        await generateTokens(user);

      const role = user.roles[0];
      const newAccessToken = accessToken;
      const newRefreshToken = refreshToken;
      const newAccessTokenExp = accessTokenExp;
      const newRefreshTokenExp = refreshTokenExp;

      // Set Cookies
      setTokensCookies(
        res,
        role,
        newAccessToken,
        newRefreshToken,
        newAccessTokenExp,
        newRefreshTokenExp
      );

      // Send success response with tokens
      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles[0],
        },
        status: "success",
        message: "Login successful",
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_exp: accessTokenExp,
        is_auth: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to login, please try again later",
      });
    }
  };

  // Profile OR Logged in User
  static userProfile = async (req, res) => {
    res.send({ user: req.user });
  };

  // Change Password
  static changeUserPassword = async (req, res) => {
    try {
      const { password, password_confirmation } = req.body;

      // Check if both password and password_confirmation are provided
      if (!password || !password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "New Password and Confirm New Password are required",
        });
      }

      // Check if password and password_confirmation match
      if (password !== password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "New Password and Confirm New Password don't match",
        });
      }

      // Generate salt and hash new password
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      // Update user's password
      await UserModel.findByIdAndUpdate(req?.user._id, {
        $set: { password: newHashPassword },
      });

      // Send success response
      res
        .status(200)
        .json({ status: "success", message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({
        status: "failed",
        message: "Unable to change password, please try again later",
      });
    }
  };

  // Send Password Reset Link via Email
  static sendUserPasswordResetEmail = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ status: "failed", message: "Email field is required" });
      }
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "Email doesn't exist" });
      }
      // Generate token for password reset
      const secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });
      // Reset Link
      const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;

      try {
        const mail = await sgMail.send({
          to: user.email,
          from: process.env.EMAIL_FROM,
          subject: "Password Reset Link",
          html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">click here</a> to reset your password.</p>`,
        });
        // Send success response
        console.log(mail);
        res.status(200).json({
          status: "success",
          message: "Password reset email sent. Please check your email.",
        });
      } catch (emailError) {
        console.error(
          "SendGrid failed:",
          emailError.response?.body || emailError.message
        );
        return res.status(500).json({
          status: "failed",
          message:
            "Failed to send password reset email. Please try again later.",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to send password reset email. Please try again later.",
      });
    }
  };

  // Password Reset
  static userPasswordReset = async (req, res) => {
    try {
      const { password, password_confirmation } = req.body;
      const { id, token } = req.params;
      // Find user by ID
      const user = await UserModel.findById(id);
      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "User not found" });
      }
      // Validate token
      const new_secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
      jwt.verify(token, new_secret);

      // Check if password and password_confirmation are provided
      if (!password || !password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "New Password and Confirm New Password are required",
        });
      }

      // Check if password and password_confirmation match
      if (password !== password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "New Password and Confirm New Password don't match",
        });
      }

      // Generate salt and hash new password
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      // Update user's password
      await UserModel.findByIdAndUpdate(user._id, {
        $set: { password: newHashPassword },
      });

      // Send success response
      res
        .status(200)
        .json({ status: "success", message: "Password reset successfully" });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          status: "failed",
          message: "Link expired. Please request a new password reset link.",
        });
      }
      return res.status(500).json({
        status: "failed",
        message: "Unable to reset password. Please try again later.",
      });
    }
  };
  static protected = async (req, res) => {
    try {
      const { cookies } = req;

      if (!cookies || !cookies.is_auth || !cookies.role) {
        return res.status(401).json({
          status: "failed",
          message: "Unauthorized: Missing auth cookies",
          is_auth: false,
          role: null,
        });
      }

      const is_auth = String(cookies.is_auth).toLowerCase() === "true";
      const role = cookies.role;

      // Optional: Validate role against allowed values
      if (!["admin", "user"].includes(role)) {
        return res.status(403).json({
          status: "failed",
          message: "Invalid role",
          is_auth: false,
          role: null,
        });
      }

      return res.status(200).json({
        status: "success",
        is_auth,
        role,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
        is_auth: false,
        role: null,
      });
    }
  };
  // Logout
  static userLogout = async (req, res) => {
    try {
      const cookieOptions = {
        path: "/",
        secure: true,
        sameSite: "None",
      };

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);
      res.clearCookie("is_auth", cookieOptions);
      res.clearCookie("role", cookieOptions);

      res.status(200).json({ status: "success", message: "Logout successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to logout, please try again later",
      });
    }
  };

  static async GetUser(req, res) {
    try {
      const users = await UserModel.find({}); // This should fetch all users

      res.status(200).send({
        success: true,
        message: "All Users fetched successfully",
        users, // Return users here instead of products
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Error in fetching Users",
        error,
      });
    }
  }
  static async UpdateUser(req, res) {
    const { role } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!role) {
      return res.status(400).json({
        message: "Please provide a role",
      });
    }
    // Validate role is either 'user' or 'admin'
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Role must be 'user' or 'admin'.",
      });
    }
    try {
      // Check if the user exists
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Update the user in the database
      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: id },
        { $set: { roles: [role] } },
        { new: true }
      );

      // Respond with the updated user data
      res.status(200).json({
        message: "User updated successfully",
        updatedUser,
      });
    } catch (error) {
      console.error("Error in UpdateUser:", error);
      res.status(500).json({
        message: "An error occurred while processing your request",
      });
    }
  }
}

export default UserController;
