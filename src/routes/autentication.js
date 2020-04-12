const express = require('express');
const router  = express.Router();

const passport = require('passport');

const { isLoggedIn,
        isNotLoggedIn
} = require('../lib/auth');

router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('auth/login', { layout: 'login'});
});

router.post('/login', (req,res,next) => {
    passport.authenticate('local.login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next);
});

router.get('/home', isLoggedIn, (req, res) => {
    res.render('home');
});

router.get('/acerca-de', isLoggedIn, (req, res) => {
    res.render('about');
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

module.exports = router;