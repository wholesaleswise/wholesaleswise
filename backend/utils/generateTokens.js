import jwt from "jsonwebtoken";
import UserRefreshTokenModel from "../models/UserRefreshToken.js";
const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };

    // Access Token Expires in 100 seconds
    const accessTokenExp = Math.floor(Date.now() / 1000) + 100;
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );

    // Refresh Token Expires in 24 hours
    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );

    // Delete existing refresh token
    const deletedToken = await UserRefreshTokenModel.deleteMany({
      userId: user?._id,
    });

    if (deletedToken) {
      console.log(`Deleted refresh token for user ${user._id}`);
    } else {
      console.log(`No refresh token found for user ${user._id}`);
    }

    // Save New Refresh Token
    await new UserRefreshTokenModel({
      userId: user?._id,
      token: refreshToken,
    }).save();

    return Promise.resolve({
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    });
  } catch (error) {
    console.error("Error generating tokens:", error);
    return Promise.reject(error);
  }
};

export default generateTokens;
