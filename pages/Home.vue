<template>
  <v-container class="d-flex flex-row justify-center align-center">
    <img src="/KnightLogo-compressed.jpg" alt="logo" height="400" />
    <v-card
      height="380"
      class="d-flex flex-column justify-space-between align-center bg-green-lighten-5"
    >
      <v-card-title class="text-h1 pa-10">Chess</v-card-title>
      <div class="d-flex flex-column align-start">
        <v-btn size="x-large" class="w-100 my-2 bg-green">Play</v-btn>
        <v-btn size="x-large" class="w-100 bg-green">
          <NuxtLink to="/board">Use a board</NuxtLink>
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
a {
  text-decoration: none;
  color: white;
}
</style>
