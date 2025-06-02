import UserModel from "../models/User.js";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";
import generateTokens from "./generateTokens.js";
import verifyRefreshToken from "./verifyRefreshToken.js";

const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    // Verify Refresh Token is valid or not
    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);

    if (error) {
      const cookieOptions = {
        path: "/",
        secure: true,
        sameSite: "None",
      };

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);
      res.clearCookie("is_auth", cookieOptions);
      res.clearCookie("role", cookieOptions);
      return res
        .status(401)
        .send({
          status: "failed",
          message: "Please Login first!!",
          error: "Invalid refresh token",
        });
    }
    // Find User based on Refresh Token detail id
    const user = await UserModel.findById(tokenDetails._id);

    if (!user) {
      return res.status(404).send({
        status: "failed",
        message: "Please Login first!!",
        error: "User not found",
      });
    }

    const userRefreshToken = await UserRefreshTokenModel.findOne({
      userId: tokenDetails?._id,
    });
    if (
      oldRefreshToken !== userRefreshToken.token ||
      userRefreshToken.blacklisted
    ) {
      // res.redirect(`${process.env.FRONTEND_HOST}/account/login`);
      return res.status(401).send({
        status: "failed",
        message: "Please Login first!!",
        error: "Unauthorized access",
      });
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await generateTokens(user);
    return {
      user,
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: error.message || "Internal server error",
    });
  }
};

export default refreshAccessToken;
