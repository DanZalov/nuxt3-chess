<script setup lang="ts">
const socket = useSocket()

const connected = ref(false)
const clicked = ref(false)

function sendMessage() {
  socket.emit('message', 'I clicked')
  console.log('clicked')
}

onMounted(() => {
  socket.on('connect', () => {
    connected.value = socket.connected
  })

  socket.on('message', (message) => {
    clicked.value = true
    console.log('Client heared from server: ', message)
  })

  socket.on('disconnect', () => {
    connected.value = socket.connected
  })
})
</script>

<template>
  <div>Connected: {{ connected }}</div>
  <button @click="sendMessage">{{ clicked ? 'Clicked' : 'Click' }}</button>
</template>
