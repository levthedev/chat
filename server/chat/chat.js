function toggleChat() {
  document.getElementById('container').classList.remove('preload');
  var state = this.id;
  var open = document.getElementById('open');
  var closed = document.getElementById('closed');
  var conversation = document.getElementById('conversation')
  if (state === 'closed') {
    closed.classList.toggle('fadeIconOut');
    open.classList.toggle('fadeIconOut');
    closed.classList.toggle('fadeIconIn');
    open.classList.toggle('fadeIconIn');
    conversation.classList.toggle('fadeIn');
    var messagesNode = document.getElementById('messages');
    messagesNode.scrollTop = messagesNode.scrollHeight;
  } else if (state === 'open') {
    closed.classList.toggle('fadeIconOut');
    open.classList.toggle('fadeIconOut');
    closed.classList.toggle('fadeIconIn');
    open.classList.toggle('fadeIconIn');
    conversation.classList.toggle('fadeIn');
  }
}

function formatTime(date) {
  var seconds = Math.floor((new Date() - new Date(date)) / 1000);
  var format = function(length, word) {
    var interval = Math.floor(seconds / length);
    return interval >= 1 ? `${interval} ${word}${interval > 1 ? 's' : ''} ago` : false;
  };
  return format(2592000, 'month') || format(604800, 'week') || format(86400, 'day') || format(3600, 'hour') || format(60, 'minute') || 'Just now';
}

function populateChat(conversation) {
  var messagesNode = document.getElementById('messages');
  conversation.forEach(function(message, i) {
    var messageNode = document.createElement('p');
    var timeStampNode = document.createElement('div');

    messageNode.textContent = message.text;
    timeStampNode.textContent = formatTime(message.createdAt);

    messageNode.className = `message ${message.sender}`;
    timeStampNode.className = `timestamp ${message.sender}Time`;

    messageNode.id = (message.id);
    messagesNode.appendChild(messageNode);
    messagesNode.appendChild(timeStampNode);
  })
}

function submitChat(e) {
  if (e.keyCode === 13) {
    var input = document.getElementById('input');
    socket.emit('customerMessage', input.value)
    input.value = '';
  }
}

function createSocket() {
  socket = io('http://localhost:3000/');

  socket.on('messageCreated', function(message) {
    var messagesNode = document.getElementById('messages');
    var messageNode = document.createElement('p');
    var timeStampNode = document.createElement('div');

    messageNode.textContent = message.text;
    timeStampNode.textContent = formatTime(message.createdAt);

    messageNode.className = `message ${message.sender}`;
    timeStampNode.className = `timestamp ${message.sender}Time`;

    messageNode.id = message.id;
    messagesNode.appendChild(messageNode);
    messagesNode.appendChild(timeStampNode);
    messagesNode.scrollTop = messagesNode.scrollHeight;
  });

  socket.on('messageHistory', function(messages) {
    populateChat(messages);
  });
}

function addStyleSheet() {
  var link = document.createElement('link');
  link.href = 'http://127.0.0.1:3000/styles.css';
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.body.appendChild(link);
}

function createChatWidget() {;
  var container = document.createElement('div');
  container.id = 'container';
  container.className = 'preload';
  var conversation = document.createElement('div');
  conversation.id = 'conversation';
  conversation.style.opacity = 0;
  var header = document.createElement('div');
  header.id = 'header';
  header.textContent = 'Chat with Lev';
  var messages = document.createElement('div');
  messages.id = 'messages';
  var inputWrapper = document.createElement('div');
  inputWrapper.id = 'inputWrapper';
  var input = document.createElement('input');
  input.id = 'input';
  input.placeholder = 'Send a message...';
  var powered = document.createElement('div');
  powered.id = 'powered';
  var poweredLink = document.createElement('a');
  poweredLink.href = 'https://github.com/levthedev'
  poweredLink.textContent = 'Powered by HumbleChat';
  var closed = document.createElement('div');
  closed.id = 'closed';
  closed.onclick = toggleChat;
  closed.className = 'fadeIconIn';
  var open = document.createElement('div');
  open.id = 'open';
  open.onclick = toggleChat;
  open.className = 'fadeIconOut';

  document.body.appendChild(container)
  container.appendChild(conversation)
  conversation.appendChild(header)
  conversation.appendChild(messages)
  conversation.appendChild(inputWrapper)
  inputWrapper.appendChild(input)
  inputWrapper.appendChild(powered)
  powered.appendChild(poweredLink)
  container.appendChild(closed)
  container.appendChild(open)
}

document.addEventListener('DOMContentLoaded', function(event) {
  addStyleSheet();
  createChatWidget();
  createSocket();
  document.getElementById('input').addEventListener('keyup', submitChat);
});
