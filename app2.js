const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const port = process.env.PORT || 3000;

const SESSION_FILE_PATH = './session.json';

let client;

// Verificar se existe uma sessão salva
if (fs.existsSync(SESSION_FILE_PATH)) {
  const sessionData = require(SESSION_FILE_PATH);
  client = new Client({
    session: sessionData,
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
  });
} else {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
  });
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/views/chat.html');
});

io.on('connection', (socket) => {
  console.log('Socket.io connected!');
  console.log(`Socket ${socket.id} connected app.js`);

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected!');
  });

  client.on('qr', (qr) => {
    console.log('QR code generated!');
    qrcode.toDataURL(qr, { margin: 2 }, (err, url) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('QR code URL generated!');
      // Envie a URL do código QR para o front-end
      socket.emit('qr', url);
    });
  });

  client.on('ready', () => {
    console.log('Client is ready!');
    // Salve a sessão no arquivo session.json
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(client.getSession()));
  });
  
  client.on('message_create', async (msg) => {
    // Verifique se a mensagem recebida não é do próprio bot
    if (!msg.fromMe) {
      // Enviar mensagem para o socket do cliente conectado
      io.emit('message', {
        body: msg.body,
        from: msg.from
      });
    }
  });

  client.on('auth_failure', () => {
    console.log('Authentication failed!');
    // Exclua o arquivo de sessão, se existir
    if (fs.existsSync(SESSION_FILE_PATH)) {
      fs.unlinkSync(SESSION_FILE_PATH);
    }
  });

  client.initialize();


  // Recebe mensagem do front-end e envia para o contato
  socket.on('sendMessage', (data) => {
    const { message, number } = data;
    client.sendMessage(`${number}@c.us`, message);
  });

  // Recebe contato do front-end e envia a lista de mensagens
  socket.on('getMessages', (number) => {
    client.getChatById(`${number}@c.us`).then((chat) => {
      chat.getAllMessages().then((messages) => {
        const formattedMessages = messages.map((message) => ({
          fromMe: message.fromMe,
          body: message.body,
        }));
        socket.emit('receiveMessages', formattedMessages);
      });
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
