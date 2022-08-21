const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.igw9v.mongodb.net/?retryWrites=true&w=majority');

exports.userScheme = mongoose.Schema({
    id: Number,
    username: String,
    email: String,
    password: String
});

exports.channelScheme = mongoose.Schema({
    id: Number,
    channel_id: Number
});

exports.messageScheme = mongoose.Schema({
    id:Number,
    author: Number,
    content: String,
    channel_id: Number,
    date: Number
})