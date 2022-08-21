const express = require('express');
const app = express();
const http = require('http');
var server = http.createServer(app)
const expressSession = require('express-session');
const helmet = require('helmet');
require('./database/DatabaseIndex');
var winston = require('winston'),
expressWinston = require('express-winston'); 
const rateLimit = require('express-rate-limit');

app.set('view engine','ejs');
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }}
));
app.use(helmet({referrerPolicy: { policy: "no-referrer" }}));
app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console()
    ],
    format: winston.format.combine(
      winston.format.json()
    ),
    meta: true, 
    msg: "HTTP {{req.method}} {{req.url}}", 
    expressFormat: true, 
}));
app.use(rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 100, 
	standardHeaders: true, 
	legacyHeaders: false, 
}));


app.use('/',require('./routers/server'));

app.use((req,res,next) => {
    res.send('Error');
});

server.listen(3000);