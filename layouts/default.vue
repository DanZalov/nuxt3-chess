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
