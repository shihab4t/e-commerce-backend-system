const authRouter = require("./controllers/auth.controller");
const userRouter = require("./controllers/users.controller");
const router = require("express").Router();

router.use("/users", userRouter);
router.use("/auths", authRouter);

module.exports = router;