const jwt = require('jsonwebtoken');
const config = require('../config.json');

exports.idGenerate = () => {
    var now = Date.now();
    var random = Math.floor(Math.random()*999999999999)
    var id = now+random;
    return id;
};

exports.requestAuthToken = (req,res,next) => {
    const authHeader = req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    
    if(token == undefined){
        if(req.url === "/login")return res.status(200).render('login');
        if(req.url === "/register")return res.status(200).render('register');    
        return res.status(403).send('Token invalid.');
    }

    jwt.verify(token,config.SECRET_TOKEN, (err,user) => {
        if(err) {
            if(req.url === "/login")return res.status(200).render('login');
            if(req.url === "/register")return res.status(200).render('register');    
            return res.status(403).send('Access Denied.');
        }
        req.user = user;
        next()
    })
};

exports.socketAuthToken = (socket,next) => {
    if(socket.handshake.query && socket.handshake.query.token){
        jwt.verify(socket.handshake.query.token, config.SECRET_TOKEN, (err,user) => {
            if(err)return next(new Error('Auth Error.'));
            socket.user = user;
            next();
        });
    }
};