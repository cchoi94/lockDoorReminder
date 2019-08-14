const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const socketIo = require('socket.io')
const geolib = require('geolib')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const locationMap = new Map()

let isUserAlerted = false

app.use(express.static(path.join(__dirname, '/')))

app.use(bodyParser.json())

io.on('connection', socket => {
  locationMap.set(socket.id, { lat: null, lng: null })
  
  isUserAlerted = false

  socket.on('setInitialLocation', pos => {
    if (locationMap.has(socket.id)) {
      locationMap.set(socket.id, pos)
      app.post('/api', (req, res, next) => {
        res.status(201).json(req.body)
      })
    }
  })
  
  socket.on('updateLocation', pos => {
    const { lat: initLat, lng: initLng} = locationMap.get(socket.id)
    if (geolib.isPointWithinRadius({ latitude: pos.lat, longitude: pos.lng }, { latitude: initLat, longitude: initLng}, 10)) {
      isUserAlerted = false
    } else {
      if (!isUserAlerted) {
        socket.emit('alertUser', true)
        isUserAlerted = true
      }
    }
  })

  socket.on('disconnect', () => {
    locationMap.delete(socket.id)
  })
})

server.listen((process.env.port || 3000), err => {
  if (err) {
    throw err
  }

  console.log('server started on port 3000')
})