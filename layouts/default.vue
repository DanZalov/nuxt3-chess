<script setup lang="ts">
const socket = useSocket()

onMounted(() => {
  navigateTo('/')
  const sessionID = localStorage.getItem('sessionID')
  console.log('sessionID from storage: ', sessionID)

  socket.emit('session', sessionID)

  socket.on('session', (sessionID) => {
    console.log('Client heard from server: ', sessionID)
    if (sessionID) {
      // attach the session ID to the next reconnection attempts
      socket.auth = { sessionID }
      // store it in the localStorage
      localStorage.setItem('sessionID', sessionID)
    }
  })
  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, you need to reconnect manually
      console.log('disconnected by server')
    }
    // else the socket will automatically try to reconnect
    console.log('disconnected for unknown reason')
    socket.connect()
  })
})

onUnmounted(() => {
  socket.off('session')
})
</script>
<template>
  <div id="app-layout">
    <Head>
      <Title>Chess player</Title>
      <Meta name="description" content="online chess player" />
      <Meta
        name="keywords"
        content="chess, nuxt, vue, vuetify, typescript, socket.io"
      />
      <Meta name="author" content="Danil Zalialutdinov" />
    </Head>
    <main>
      <slot />
    </main>
  </div>
</template>

<style>
body {
  background-color: #ffe0b2;
}
</style>
