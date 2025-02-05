// Replace this Channel ID if you are using this for another project
const CLIENT_ID = 'IQRiUyk6juaLVuwR';

const drone = new ScaleDrone(CLIENT_ID, {
  data: { // Will be sent out as clientData via events
    name: getUserName(),
    color: getRandomColor(),
  },
});

let members = [];

drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  console.log('Successfully connected to Scaledrone');

  const room = drone.subscribe('observable-room');
  room.on('open', error => {
    if (error) {
      return console.error(error);
    }
    console.log('Successfully joined room');
  });

  room.on('members', m => {
    members = m;
    updateMembersDOM();
  });

  room.on('member_join', member => {
    members.push(member);
    updateMembersDOM();
  });

  room.on('member_leave', ({id}) => {
    const index = members.findIndex(member => member.id === id);
    members.splice(index, 1);
    updateMembersDOM();
  });

  room.on('data', (message, member) => {
    if (member) {
      addMessageToListDOM(message, member);
    } else {
      // Message is from server
    }
  });
});

drone.on('close', event => {
  console.log('Connection was closed', event);
});

drone.on('error', error => {
  console.error(error);
});

function getUserName() {
  let userName = localStorage.getItem('userName');
  if (!userName) {
    userName = prompt('Please enter your name:');
    localStorage.setItem('userName', userName);
  }
  return userName;
}

function changeUserName() {
  const newUserName = prompt('Enter your new name:');
  if (newUserName) {
    localStorage.setItem('userName', newUserName);
    location.reload(); // Reload the page to apply the new name
  }
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

// Add this function to format the current time
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Modify the sendMessage function to include the timestamp
function sendMessage() {
  const value = DOM.input.value;
  if (value === '') {
    return;
  }
  const message = {
    text: value,
    time: getCurrentTime(),
  };
  DOM.input.value = '';
  drone.publish({
    room: 'observable-room',
    message: message,
  });
}

// Modify the function that creates a message element to include the timestamp
function createMessageElement(message, member) {
  const el = document.createElement('div');
  el.appendChild(createMemberElement(member));
  const messageText = document.createTextNode(`${message.time} - ${message.text}`);
  el.appendChild(messageText);
  el.className = 'message';
  return el;
}

// Modify the function that adds a message to the DOM
function addMessageToListDOM(message, member) {
  const el = DOM.messages;
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.appendChild(createMessageElement(message, member));
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
  changeNameButton: document.querySelector('.change-name-button'), // New button to change name
};

DOM.form.addEventListener('submit', sendMessage);
DOM.changeNameButton.addEventListener('click', changeUserName); // Event listener for the change name button
