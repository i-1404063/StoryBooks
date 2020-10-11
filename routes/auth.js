const express = require("express");
const passport = require("passport");
const router = express.Router();

//@desc Auth with Google
//@route Get /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

//@desc Google auth callback
//@route Get/ auth/google/front
router.get(
  "/google/front",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    res.redirect("/dashboard");
  }
);

//@desc   Logout user
//@route  logout /auth/logout
router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

module.exports = router;
