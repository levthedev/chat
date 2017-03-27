var baseHref = 'http://174.138.71.184'
if (window.location.href.includes('localhost')) {
  baseHref = 'http://localhost'
}
baseHref += ':3000'

function toggleChat() {
  document.getElementById('container').classList.remove('preload');
  document.getElementById('conversation').classList.toggle('zIndex');
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
  } else if (state === 'open') {
    closed.classList.toggle('fadeIconOut');
    open.classList.toggle('fadeIconOut');
    closed.classList.toggle('fadeIconIn');
    open.classList.toggle('fadeIconIn');
    conversation.classList.toggle('fadeIn');
    var messagesNode = document.getElementById('messages');
    messagesNode.scrollTop = messagesNode.scrollHeight;
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

function sendMessage(e) {
  var input = document.getElementById('input');
  if (e.keyCode === 13 && input.value !== '') {
    socket.emit('customerMessage', input.value)
    input.value = '';
  }
}

function createSocket() {
  socket = io(baseHref);

  socket.on('messageCreated', function(message) {
    stopTyping();
    var messagesNode = document.getElementById('messages');
    var messageNode = document.createElement('p');
    var timeStampNode = document.createElement('div');
    var messagesNode = document.getElementById('messages');
    var typing = document.getElementById('typingIndicator');

    messageNode.textContent = message.text;
    timeStampNode.textContent = formatTime(message.createdAt);

    messageNode.className = `message ${message.sender}`;
    timeStampNode.className = `timestamp ${message.sender}Time`;

    if (typing) typing.parentElement.removeChild(typing);
    messageNode.id = message.id;
    messagesNode.appendChild(messageNode);
    messagesNode.appendChild(timeStampNode);
    messagesNode.scrollTop = messagesNode.scrollHeight;
  });

  socket.on('messageHistory', function(messages) {
    populateChat(messages);
  });

  socket.on('agentTyping', function(data) {
    var messagesNode = document.getElementById('messages');
    var typingNode = document.getElementById('typingIndicator');
    var input = document.getElementById('input');
    var inputWrapper = document.getElementById('inputWrapper');

    if (data && !typingNode) {
      var typing = document.createElement('div');
      typing.id = 'typingIndicator';
      var dotOne = document.createElement('span');
      dotOne.id='dotOne';
      var dotTwo = document.createElement('span');
      dotTwo.id='dotTwo';
      var dotThree = document.createElement('span');
      dotThree.id='dotThree';

      inputWrapper.insertBefore(typing, input);
      typing.appendChild(dotOne);
      typing.appendChild(dotTwo);
      typing.appendChild(dotThree);
      messagesNode.scrollTop = messagesNode.scrollHeight;
    } else if (!data && typingNode) {
      typingNode.parentElement.removeChild(typingNode);
    }
  });
}

function addStyleSheet() {
  var link = document.createElement('link');
  link.href = baseHref + '/chatStyles';
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.body.appendChild(link);
}

function startTyping() {
  if (!typing) {
    typing = true;
    socket.emit('userTyping', true)
  }
}

function stopTyping() {
  if (typing) {
    typing = false;
    socket.emit('userTyping', false)
  }
}

function createChatWidget() {;
  var container = document.createElement('div');
  container.id = 'container';
  container.className = 'preload';
  var conversation = document.createElement('div');
  conversation.id = 'conversation';
  conversation.classList.add('zIndex');
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
  input.onkeyup = startTyping;
  input.onfocus = startTyping;
  input.onblur = stopTyping;
  typing = false;
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
  document.getElementById('input').addEventListener('keyup', sendMessage);
});
