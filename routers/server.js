const { application } = require('express');
const express = require('express');
const { requestAuthToken, idGenerate } = require('../utilts/Authentication');
const router = express.Router();
const mongooese = require('mongoose');
const { channelModel, channelScheme, messageScheme, userScheme } = require('../database/DatabaseIndex');
var bcrypt = require("bcryptjs");

router.get('/',(req,res,next) => {
    res.render('index');
});

router.use(requestAuthToken,(req,res,next) => {
    if(req.session.user_id == undefined)return res.status(403);
});

router.get('/login', (req,res,next) => {
    res.render('login');
})

router.get('/register',(req,res,next) => {
    res.render('register');

});

router.post('/register',(req,res,next) => {
    const User = mongooese.model('User', userScheme);

    User.findOne({
        username: req.body.username
      }).exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (user) {
          res.status(400).send({ message: "Failed! Username is already in use!" });
          return;
        }
        // Email
        User.findOne({
          email: req.body.email
        }).exec((err, user) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          if (user) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
            return;
          }
          const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8)
          });
    
          user.save((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            res.send({ message: "User was registered successfully!" });
          });
        });
    });

        
});

router.post('/login',(req,res,next) => {
    const User = mongooese.model('User', userScheme);
    User.findOne({email: req.body.email}).exec((err,user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
              accessToken: null,
              message: "Invalid Password!"
            });
        }
        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });
        
        req.session.user_id = user.id

        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            accessToken: token
        });
    });
});

const channelAccess = (req,res,next) => {
    const Channel = mongooese.model('Channel',channelScheme);

    Channel.findOne({id:req.session.user_id,channel_id:req.params.id}).exec((err,channel) => {
        if(channel == null || channel == undefined) return res.status(403).send('Access Denied.');
        if(err) return res.status(403)
        if(channel != null)next();
    });
}

router.get('/channels',(req,res,next) => {
    const Channel = mongooese.model('Channel',channelScheme);
    Channel.where({author: req.session.user_id}).exec((err,results) => {
        res.send(results);
    });
});

router.get('/channels/:id',channelAccess,(req,res,next) => {
    res.render('chat-index');
})

router.get('/channels/:id/messages',channelAccess,(req,res,next) => {
    const Message = mongooese.model('Message',messageScheme);
    Message.where('author').equals(req.session.user_id).limit(50).exec((err,results) => {
        res.status(200).send(results);
    });
});

router.post('/channels/:id/messages',channelAccess,(req,res,next) => {
    const Message = mongooese.model('Message',messageScheme);
    Message.insertMany([{id:idGenerate,author:req.session.user_id,content:req.body.content,channel_id: req.params.id,date: Date.now()}])
});


module.exports = router;