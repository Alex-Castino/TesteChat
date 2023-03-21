const socket = io();

const chat = document.querySelector('.chat');
const contactName = document.querySelector('.contact-name');
const messageInput = document.querySelector('.message-input');
const sendButton = document.querySelector('.send-button');
const chatBody = document.querySelector('.chat-body');

// Conectando com o servidor
socket.on('connect', () => {
  console.log('Connected to server!');
});

function addMessageToChat(from, body) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const senderElement = document.createElement('span');
  senderElement.classList.add('sender');
  senderElement.innerText = from + '\n';

  const messageTextElement = document.createElement('span');
  messageTextElement.classList.add('message-text');
  messageTextElement.innerText = body;

  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageTextElement);

  const chatBody = document.querySelector('.chat-body');
  chatBody.appendChild(messageElement);

  chatBody.scrollTop = chatBody.scrollHeight;
}
socket.on('message', (data) => {
  console.log('message received:', data);
  
  const { from, body } = data;
  addMessageToChat(from+'\n', body+'\n\n\n');
});


socket.on('connection', (socket) => {
  console.log('Socket.io connected!');
  console.log(`Socket ${socket.id} connected socketconect.js.js`);
});


// Quando receber uma mensagem
socket.on('message', (message) => {
  console.log('Message received:', message);

  // Adicionando a mensagem na lista de mensagens
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerText = message;
  chatBody.appendChild(messageElement);
});

// Quando o nome do contato for atualizado
socket.on('contactName', (name) => {
  console.log('Contact name updated:', name);

  // Atualizando o nome do contato na tela
  contactName.innerText = name;
});

// Enviando mensagem
sendButton.addEventListener('click', () => {
  const message = messageInput.value;

  // Enviando mensagem para o servidor
  socket.emit('message', message);

  // Adicionando a mensagem na lista de mensagens
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'message-sent');
  messageElement.innerText = message;
  chatBody.appendChild(messageElement);

  // Limpando o campo de mensagem
  messageInput.value = '';
});
