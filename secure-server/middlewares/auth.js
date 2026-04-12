"use strict";

module.exports = function authenticateToken(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  return res.redirect("/login");
};