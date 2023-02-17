const express = require('express')
const path = require('path')
const http = require('http')


const app = express()
const server = http.createServer(app)
const wss = require('socket.io').listen(server)

require('./models/connection')


app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(function (_, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    )
    next()
})


app.use(express.static(path.join(__dirname, 'build')))
app.use(express.static(path.join(__dirname, 'uploads')))


require('./auth/passport')

app.use('/api', require('./routes'))

app.use('*', (_req, res) => {
  const file = path.resolve(__dirname, 'build', 'index.html')
  res.sendFile(file)
})

app.use((err, _, res, __) => {
  console.log(err.stack)
  res.status(500).json({
    code: 500,
    message: err.message,
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, function () {
  console.log('Environment', process.env.NODE_ENV)
  console.log(`Server running. Use our API on port: ${PORT}`)
})

const connectUsers = {}
const historyMessage = {
  
}

wss.on('connection', (socket) => {
  const socketId = socket.id

  socket.on('users:connect', (data) => {
    console.log(data)
    const user = { ...data, socketId, activeRoom: null }

    connectUsers[socketId] = user

    console.log(Object.values(connectUsers))

    socket.emit('users:list', Object.values(connectUsers)) // Отправка себе отправляем всех пользователей которые в онлайн
    socket.broadcast.emit('users:add', user) // Отправка себя всем остальным юзерам
  })
  socket.on('message:add', (data) => {
    const { senderId, recipientId } = data

    socket.emit('message:add', data)

    socket.broadcast.to(data.roomId).emit('message:add', data)
    addHistory(senderId, recipientId, data)
    addHistory(recipientId, senderId, data)
  })
  socket.on('message:history', (data) => {
    if (historyMessage[data.userId] && historyMessage[data.userId][data.recipientId]) {
      socket.emit('message:history', [])
    }
  })
  socket.on('disconnect', (data) => {
    delete connectUsers[socketId]
    socket.broadcast.emit('users:leave', socketId)
  })
})

function addHistory(senderId, recipientId, data) {
  if (historyMessage[senderId]) {
    if (historyMessage[senderId][recipientId]) {
      historyMessage[senderId][recipientId].push(data)
    } else {
      historyMessage[senderId][recipientId] = []
      historyMessage[senderId][recipientId].push(data)
    }
  } else {
    historyMessage[senderId] = {}
    historyMessage[senderId][recipientId] = []
    historyMessage[senderId][recipientId].push(data)
  }
}


module.exports = { app: app, server: server }


