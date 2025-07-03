const socket = io('ws://localhost:3500')

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')

function sendMessage (e) {
  e.preventDefault()
  if (nameInput.value && msgInput.value && chatRoom.value) {
    socket.emit('message', {
      name: nameInput.value,
      text: msgInput.value
    })
    msgInput.value = ''
  }
  msgInput.focus()
}

function enterRoom (e) {
  e.preventDefault()
  if (nameInput.value && chatRoom.value) {
    socket.emit('enterRoom', {
      name: nameInput.value,
      room: chatRoom.value
    })
  }
}

document.querySelector('.form-msg').addEventListener('submit', sendMessage)

document.querySelector('.form-join').addEventListener('submit', enterRoom)

msgInput.addEventListener('keypress', () => {
  socket.emit('activity', nameInput.value)
})

// Listen for messages
socket.on('message', data => {
  activity.textContent = ''
  const { name, text, time } = data

  const li = document.createElement('li')
  li.classList.add('post')

  // Determine post direction
  if (name === nameInput.value) {
    li.classList.add('post--right')
  } else if (name !== 'Admin') {
    li.classList.add('post--left')
  }

  if (name !== 'Admin') {
    // Create header container
    const header = document.createElement('div')
    header.classList.add('post__header')
    header.classList.add(
      name === nameInput.value ? 'post__header--user' : 'post__header--reply'
    )

    // Name span
    const nameSpan = document.createElement('span')
    nameSpan.classList.add('post__header--name')
    nameSpan.textContent = name

    // Time span
    const timeSpan = document.createElement('span')
    timeSpan.classList.add('post__header--time')
    timeSpan.textContent = time

    // Add spans to header
    header.appendChild(nameSpan)
    header.appendChild(timeSpan)

    // Text div
    const textDiv = document.createElement('div')
    textDiv.classList.add('post__text')
    textDiv.textContent = text

    // Add to li
    li.appendChild(header)
    li.appendChild(textDiv)
  } else {
    // Admin message: only text div
    const textDiv = document.createElement('div')
    textDiv.classList.add('post__text')
    textDiv.textContent = text
    li.appendChild(textDiv)
  }

  chatDisplay.appendChild(li)
  chatDisplay.scrollTop = chatDisplay.scrollHeight
})

let activityTimer
socket.on('activity', name => {
  activity.textContent = `${name} is typing...`

  // Clear after 3 seconds
  clearTimeout(activityTimer)
  activityTimer = setTimeout(() => {
    activity.textContent = ''
  }, 3000)
})

socket.on('userList', ({ users }) => {
  showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    console.log("room list updated")
  showRooms(rooms)
})

function showUsers (users) {
  usersList.textContent = ''
  if (users) {
    const label = document.createElement('em')
    label.textContent = `Users in ${chatRoom.value}:`
    usersList.appendChild(label)
    users.forEach((user, i) => {
      usersList.textContent += ` ${user.name}`
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ','
      }
    })
  }
}

function showRooms (rooms) {
  roomList.textContent = ''
  if (rooms) {
    const label = document.createElement('em')
    label.textContent = `Active Rooms:`
    roomList.appendChild(label)
    rooms.forEach((room, i) => {
      roomList.textContent += ` ${room}`
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomList.textContent += ','
      }
    })
  }
}
