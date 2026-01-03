

const activeCheck = async (req, res, next) => {
  return res.status(200).json({ message: "User is active" });
};
export { activeCheck };




