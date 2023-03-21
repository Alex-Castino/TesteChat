const socket = io();

const messagesList = document.querySelector('.messages-list');
const chatInput = document.querySelector('#chat-input');
const chatForm = document.querySelector('#chat-form');
const chatSidebar = document.querySelector('.chat-sidebar');
const chatTitle = document.querySelector('.chat-title');

const contactsList = document.querySelector('.contacts-list');

const updateContactsList = (contacts) => {
  contactsList.innerHTML = '';
  contacts.forEach((contact) => {
    const contactItem = document.createElement('div');
    contactItem.classList.add('contact-item');
    contactItem.dataset.number = contact.number;
    contactItem.innerText = contact.name;
    contactsList.appendChild(contactItem);
  });
};

let activeChat = '';

const setActiveChat = (contact) => {
  activeChat = contact;
  chatTitle.innerText = contact.name;
  messagesList.innerHTML = '';
  socket.emit('get chat history', contact.number);
};

socket.on('connect', () => {
  console.log('Socket.io connected!');
});

socket.on('disconnect', () => {
  console.log('Socket.io disconnected!');
});

socket.on('qr', (qrCodeURL) => {
  const qrCodeImg = document.createElement('img');
  qrCodeImg.src = qrCodeURL;
  qrCodeImg.alt = 'QR Code';

  const qrCodeContainer = document.querySelector('.qr-code');
  qrCodeContainer.innerHTML = '';
  qrCodeContainer.appendChild(qrCodeImg);

  const waitingContainer = document.querySelector('.waiting');
  waitingContainer.classList.remove('d-none');
});

socket.on('authenticated', () => {
  console.log('Authenticated!');
  const qrCodeContainer = document.querySelector('.qr-code');
  qrCodeContainer.innerHTML = '';

  const waitingContainer = document.querySelector('.waiting');
  waitingContainer.classList.add('d-none');

  const chatContainer = document.querySelector('.chat-container');
  chatContainer.classList.remove('d-none');

  socket.emit('get contacts');
});

socket.on('contacts', (contacts) => {
  console.log(contacts);
  updateContactsList(contacts);
});

socket.on('chat history', (messages) => {
  messages.forEach((message) => {
    addMessageToList(message);
  });
});
// Função que adiciona uma mensagem na lista de mensagens do chat
function addMessageToChat(name, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const senderElement = document.createElement('span');
  senderElement.classList.add('sender');
  senderElement.innerText = name;

  const messageTextElement = document.createElement('span');
  messageTextElement.classList.add('message-text');
  messageTextElement.innerText = message;

  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageTextElement);

  const chatBody = document.querySelector('.chat-body');
  chatBody.appendChild(messageElement);

  chatBody.scrollTop = chatBody.scrollHeight;
}
socket.on('message', (name,message) => {
  console.log(message)
  if (message.from === activeChat.number || message.to === activeChat.number) {
    addMessageToList(message);
    addMessageToChat(name, message);
  }
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = chatInput.value;
  chatInput.value = '';
  const messageObj = { to: activeChat.number, message };
  addMessageToList(messageObj, true);
  socket.emit('message', messageObj);
});

contactsList.addEventListener('click', (event) => {
  const contactItem = event.target.closest('.contact-item');
  if (contactItem) {
    const number = contactItem.dataset.number;
    const name = contactItem.innerText;
    setActiveChat({ number, name });
  }
});

const addMessageToList = (message, isSent = false) => {
  const messageItem = document.createElement('li');
  messageItem.classList.add('message-item', isSent ? 'sent' : 'received');

  const messageText = document.createElement('span');
  messageText.classList.add('message-text');
  messageText.innerText = message.message;

  const messageTime = document.createElement('span');
  messageTime.classList.add('message-time');
  messageTime.innerText = new Date(message.timestamp).toLocaleTimeString();

  messageItem.appendChild(messageText);
  messageItem.appendChild(messageTime);
  messagesList.appendChild(messageItem);
};
