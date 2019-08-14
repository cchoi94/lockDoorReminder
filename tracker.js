document.addEventListener('DOMContentLoaded', () => {
  const socket = io('/')

  const location = navigator.geolocation

  const positionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0 //device cannot use a cached position and must attempt to retrieve the real current position
  }

  location.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords
    socket.emit('setInitialLocation', { lat, lng })
      fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lng })
      })
  })

  setInterval(() => {
    location.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      socket.emit('updateLocation', { lat, lng })
    }, error => {
      console.log(error)
    }, positionOptions)
  }, 5000)

  socket.on('alertUser', alertUser => {
    if(alertUser) {
      alert('Remember to lock you door!')
    }
  })

})