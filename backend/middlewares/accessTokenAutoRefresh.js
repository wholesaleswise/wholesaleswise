import refreshAccessToken from "../utils/refreshAccessToken.js";
import isTokenExpired from "../utils/isTokenExpired.js";
import setTokensCookies from "../utils/setTokensCookies.js";
const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken && !isTokenExpired(accessToken)) {
      //  Add the access token to the Authorization header
      req.headers["authorization"] = `Bearer ${accessToken}`;
      return next();
    }

    if (!accessToken || isTokenExpired(accessToken)) {
      // Attempt to get a new access token using the refresh token
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        // res.redirect(`${process.env.FRONTEND_HOST}/account/login`);
        return res.status(401).json({ message: "Please Login first!!" });
      }

      // Access token is expired, make a refresh token request
      const {
        user,
        newAccessToken,
        newRefreshToken,
        newAccessTokenExp,
        newRefreshTokenExp,
      } = await refreshAccessToken(req, res);

      if (res.headersSent) {
        return;
      }
      const role = user?.roles[0];

      // set cookies
      setTokensCookies(
        res,
        role,
        newAccessToken,
        newRefreshToken,
        newAccessTokenExp,
        newRefreshTokenExp
      );

      //  Add the access token to the Authorization header
      req.headers["authorization"] = `Bearer ${newAccessToken}`;
    }
    next();
  } catch (error) {
    if (!res.headersSent) {
      return res.status(401).json({
        message: error.message || "Unauthorized",
      });
    }
  }
};

export default accessTokenAutoRefresh;
