// Conexão com o servidor de WebSocket
const socket = io.connect();

// Elementos da interface do chat
const chatContainer = document.querySelector('.chat-container');
const messagesList = document.querySelector('.messages-list');
const chatInput = document.querySelector('#chat-input');
const chatForm = document.querySelector('#chat-form');

// Elementos da interface de espera
const waiting = document.querySelector('.waiting');
const qrCode = document.querySelector('.qr-code');
const contactsList = document.querySelector('.contacts-list');

// Variável para armazenar o nome do usuário
let username;

// Função para adicionar uma mensagem à lista de mensagens
function addMessageToChat(name, message) {
  const newMessage = document.createElement('li');
  newMessage.innerHTML = `<strong>${name}</strong>: ${message}`;
  messagesList.appendChild(newMessage);
}

// Função para atualizar a lista de contatos
function updateContactsList(contacts) {
  // Limpa a lista de contatos
  contactsList.innerHTML = '';

  // Adiciona cada contato à lista
  contacts.forEach(contact => {
    const newContact = document.createElement('li');
    newContact.innerText = contact;
    newContact.addEventListener('click', () => {
      // Esconde a tela de espera e mostra a tela do chat
      waiting.classList.add('d-none');
      chatContainer.classList.remove('d-none');

      // Define o nome do contato como o destinatário da mensagem
      chatInput.setAttribute('data-recipient', contact);
      chatInput.setAttribute('placeholder', `Enviar mensagem para ${contact}...`);
    });
    contactsList.appendChild(newContact);
  });
}

// Evento para quando o usuário enviar uma mensagem
chatForm.addEventListener('submit', event => {
  event.preventDefault();

  // Recupera a mensagem digitada pelo usuário
  const message = chatInput.value;

  // Verifica se a mensagem não está vazia
  if (message.trim() !== '') {
    // Recupera o destinatário da mensagem
    const recipient = chatInput.getAttribute('data-recipient');

    // Envia a mensagem para o servidor de WebSocket
    socket.emit('message', { sender: username, recipient, message });

    // Adiciona a mensagem à lista de mensagens
    addMessageToChat('Você', message);

    // Limpa o campo de entrada de mensagens
    chatInput.value = '';
  }
});

// Evento para quando o usuário define o nome de usuário
document.querySelector('#username-form').addEventListener('submit', event => {
  event.preventDefault();

  // Recupera o nome de usuário digitado
  username = document.querySelector('#username-input').value;

  // Envia o nome de usuário para o servidor de WebSocket
  socket.emit('setUsername', username);

  // Esconde a tela de espera e mostra a lista de contatos
  waiting.classList.add('d-none');
  contactsList.classList.remove('d-none');
});

// Evento para quando o servidor envia a lista de contatos atualizada
socket.on('updateContacts', updateContactsList);

// Evento para quando o servidor envia uma nova mensagem
socket.on('message', message => {
  console.log(message)
  const messagesList = document.querySelector('.messages-list');
  const newMessage = document.createElement('li');
  newMessage.textContent = message.body;
  messagesList.appendChild(newMessage);
});


// Evento para enviar mensagem ao servidor quando o usuário enviar o formulário de chat
chatForm.addEventListener('submit', event => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (message) {
    socket.emit('chatMessage', message);
    chatInput.value = '';
  }
});
