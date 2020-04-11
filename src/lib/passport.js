const passport      = require('passport');
const localStrategy = require('passport-local').Strategy;

const pool          = require('../database');
const helpersMtds   = require('../lib/helpers');

passport.use('local.login', new localStrategy({
    usernameField: 'usrName',
    passwordField: 'usrPass',
    passReqToCallback: true
}, async (req, usrName, usrPass, done) => {
    var resData = await pool.query('SELECT * FROM admins WHERE alias_admin = ?', [usrName]);
    
    if(resData.length > 0) {
        var user = resData[0];

        if(usrPass == user.password_admin) {
            done(null, user, req.flash('success', 'Bienvenido ' + user.alias_admin));
        }
        else {
            return done(null, false, req.flash('failure', 'Contraseña inválida'));
        }
    }
    else {
        var resData = await pool.query('SELECT * FROM doctores WHERE alias_dr = ?', [usrName]);

        if(resData.length > 0) {
            var user = resData[0];
            var vPass = await helpersMtds.validatePassword(usrPass, user.password_dr);
            
            if(vPass) {
                done(null, user, req.flash('success', 'Bienvenido ' + user.alias_dr));
            }
            else {
                return done(null, false, req.flash('failure', 'Contraseña inválida'));
            }
        }
        else {
            var resData = await pool.query('SELECT * FROM enfermeros WHERE alias_enf = ?', [usrName]);

            if(resData.length > 0) {
                var user = resData[0];
                var vPass = await helpersMtds.validatePassword(usrPass, user.password_enf);

                if(vPass) {
                    done(null, user, req.flash('success', 'Bienvenido ' + user.alias_enf));
                }
                else {
                    return done(null, false, req.flash('failure', 'Contraseña inválida'));
                }
            }
            else {
                var resData = await pool.query('SELECT * FROM laboratoristas WHERE alias_lab = ?', [usrName]);
            
                if(resData.length > 0) {
                    var user = resData[0];
                    var vPass = await helpersMtds.validatePassword(usrPass, user.password_lab);
                    
                    if(vPass) {
                        done(null, user, req.flash('success', 'Bienvenido ' + user.alias_lab));
                    }
                    else {
                        return done(null, false, req.flash('failure', 'Contraseña inválida'));
                    }
                }
                else {
                    return done(null, false, req.flash('failure', 'Usuario no existe'));
                }
            }
        }
    }
}));

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

/*passport.serializeUser((user, done) => {
    if(user.tipo == "Admin") {
        done(null, user.id_admin);
    }
    else if(user.tipo == "Doctor") {
        done(null, user.id_dr);
    }
    else if(user.tipo == "Enfermero") {
        done(null, user.id_enf);
    }
    else {
        done(null, user.id_lab);
    }
});

passport.deserializeUser(async (id, done) => {
    var resData = await pool.query('SELECT * FROM admins WHERE id_admin = ?', [id]);

    if(resData.length > 0) {
        done(null, resData[0]);
    }
    else {
        var resData = await pool.query('SELECT * FROM doctores WHERE id_dr = ?', [id]);

        if(resData.length > 0) {
            done(null, resData[0]);
        }
        else {
            var resData = await pool.query('SELECT * FROM enfermeros WHERE id_enf = ?', [id]);

            if(resData.length > 0) {
                done(null, resData[0]);
            }
            else {
                var resData = await pool.query('SELECT * FROM laboratoristas WHERE id_lab = ?', [id]);

                done(null, resData[0]);
            }
        }
    }
});*/