const { jwtSign, socketAuthToken } = require('../utilts/Authentication');
const axios = require('axios').default;

module.exports = (server) => {
    const {Server} = require('socket.io');
    const io = new Server(server);

    io.use(socketAuthToken,(socket,next));

    io.on('channel join',(user) => {
        console.log(`WebSocket: ${user} joined channel.`);
    });

    io.on('channel message', (channel,message) => {
        axios({
            method: 'post',
            url: `/channels/${channel}/messages`,
            data: {
                content:message
            }
        })
    });
};