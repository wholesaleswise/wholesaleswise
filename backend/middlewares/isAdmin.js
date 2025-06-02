export const isAdmin = (req, res, next) => {
  if (req?.user && req?.user?.roles[0] === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};
