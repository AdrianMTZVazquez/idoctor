//Requires ========================
const express    = require('express');
const morgan     = require('morgan');
const handlebars = require('express-handlebars');
const path       = require('path');
const flash      = require('connect-flash');
const session    = require('express-session')
const mysqlStore = require('express-mysql-session');
const passport   = require('passport');
const ejs        = require('ejs');
const multer     = require('multer');

const { Database } = require('./keys');

//Initialization
const appExpress = express();
require('./lib/passport');


//Settings
appExpress.set('port', process.env.PORT || 3000);
appExpress.set('views', path.join(__dirname, 'views'));
appExpress.engine('.hbs', handlebars({
    defaultLayout: 'main',
    layoutsDir: path.join(appExpress.get('views'),'layouts'),
    partialsDir: path.join(appExpress.get('views'),'partials'),
    extname: '.hbs',
    helpers: {
        ifcmp: function(inpA, inpB){
            console.log(inpA + "  " + inpB);
            if(inpA === inpB) {
                return true;
            }
            else {
                return false;
            }
        },
        trimLB: function(text2Trim){
            text2Trim = text2Trim.replace(/(\r\n|\n|\r)/gm,"|");
            return text2Trim;
        },
        ln2Br: function(text2Br){
            text2Br = text2Br.replace(/(\r\n|\n|\r)/gm,"<br>");
            return text2Br;
        },
        orOpt: function(fstFlag, sndFlag){
            if(fstFlag != null ||
               sndFlag != null){
                return true;
            }
            else {
                return false;
            }
        },
        not: function(boolVal) {
            return !boolVal;
        }
    }
}));
appExpress.set('view engine', '.hbs');

//Middlewares
appExpress.use(session({
    secret: 'idoctorsession',
    resave: false,
    saveUninitialized: false,
    store: new mysqlStore(Database)
}));
appExpress.use(flash());
appExpress.use(morgan('dev'));
appExpress.use(express.urlencoded({extended: false}));
appExpress.use(express.json());
appExpress.use(passport.initialize());
appExpress.use(passport.session());

//Global Vars
appExpress.use((req, res, next) => {
    appExpress.locals.success = req.flash('success');
    appExpress.locals.failure = req.flash('failure');
    appExpress.locals.user    = req.user;
    next();
});

//Routes
appExpress.use(require('./routes'));
appExpress.use(require('./routes/autentication'));
appExpress.use('/idoctor', require('./routes/idoctor'));

//Public
appExpress.use(express.static(path.join(__dirname, 'public')));

//Start server
appExpress.listen(appExpress.get('port'), () => {
    console.log('Server started on port', appExpress.get('port'));
});