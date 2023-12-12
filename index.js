const { WebcastPushConnection } = require('tiktok-live-connector');
const tmi = require('tmi.js');
const tiktokId = "4friendzone_live"
const twitchId = "4friendzone"

const tiktok = new WebcastPushConnection(tiktokId, {});

tiktok.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
})

const twitch = new tmi.Client({ channels: [twitchId] });
twitch.connect();

tiktok.on('chat', (data) => {
    sendToSocket('tiktok', data.nickname, data.comment);
});

twitch.on('message', (channel, tags, message, self) => {
    sendToSocket('twitch', tags['display-name'], message);
});

function sendToSocket(platform, user, message) {
    console.log(`${platform} - ${user}: ${message}`);
    io.sockets.emit('message', {
        platform: platform,
        user: user,
        message: message
    });
}

const http = require('http');

const fs = require('fs');
const path = require('path');
const index = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const tiktokSvg = fs.readFileSync(path.join(__dirname, 'tiktok.svg'), 'utf8');
const twitchSvg = fs.readFileSync(path.join(__dirname, 'twitch.svg'), 'utf8');

const server = http.createServer((req, res) => {
    if (req.url === '/twitch.svg') {
        res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
        res.end(twitchSvg)
        return;
    }

    if (req.url === '/tiktok.svg') {
        res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
        res.end(tiktokSvg)
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
});

server.listen(3000);

// Socket.io
const io = require('socket.io')(server);

io.on('connection', (socket) => {
})