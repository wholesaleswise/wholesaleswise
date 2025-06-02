const setTokensCookies = (
  res,
  role,
  newAccessToken,
  newRefreshToken,
  newAccessTokenExp,
  newRefreshTokenExp
) => {
  // Calculate the remaining time until expiration in milliseconds
  const accessTokenMaxAge =
    (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenMaxAge =
    (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

  // Set Cookie for Access Token
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "None",
    maxAge: accessTokenMaxAge,
  });

  // Set Cookie for Refresh Token
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "None",
    maxAge: refreshTokenMaxAge,
  });
  res.cookie("is_auth", true, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "None",
    maxAge: refreshTokenMaxAge,
  });
  res.cookie("role", role, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "None",
    maxAge: refreshTokenMaxAge,
  });
};

export default setTokensCookies;
