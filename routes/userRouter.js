const express = require("express"),
router = express.Router(),
middleware = require('../middleware'),
passport = require('passport'),
User = require("../models/user")


router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err){
      // console.log(err);
      req.flash("error", err.message);
      return res.redirect("/user/register");
    }
    if(req.body.firstname)
      user.firstname = req.body.firstname;
    if(req.body.lastname)
      user.lastname = req.body.lastname;
    user.save((err, user) => {
      if(err) console.log(err);
      else {
        passport.authenticate("local")(req, res, () => {
          req.flash("success", "Successfully Signed Up as " + user.firstname + " " + user.lastname);
          res.redirect("/");
        });
      }
    });
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { 
      req.flash("error", err);
      return res.redirect('/user/login');
    } if (!user) { 
      req.flash("error", info.message);
      return res.redirect('/user/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        req.flash("error", err);                 
        return res.redirect('/user/login');
      }
      req.flash("success", "Successfully Signed In as " + user.firstname + " " + user.lastname);
      return res.redirect("/");  //temporarily changed
    });
  })(req, res, next);
});

router.get("/logout", middleware.isLoggedIn, (req, res) => {
  req.logout();
  req.flash("success", "Successfully Logged Out");
  res.redirect("/");
});

module.exports = router;