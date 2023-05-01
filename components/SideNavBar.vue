<script setup lang="ts">
const emit = defineEmits(['playerLeft'])

const props = defineProps<{
  position: PositionState
  game: GameOptions
}>()
const socket = useSocket()
function newGame() {
  socket.emit('restart board')
  restartBoard(props.position)
}
</script>

<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer theme="light" rail permanent>
        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-home"
            value="home"
            class="max-opacity"
            @click="navigateTo('/')"
          ></v-list-item>
          <v-list-item
            v-if="game.game"
            prepend-icon="mdi-exit-run"
            value="gameOver"
            class="max-opacity"
            @click="emit('playerLeft')"
          ></v-list-item>
          <v-list-item
            v-else
            prepend-icon="mdi-restart"
            value="reload"
            class="max-opacity"
            active-class="min-overlay-opacity"
            @click="newGame"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>

<style scoped>
.min-overlay-opacity :deep(.v-list-item__overlay) {
  opacity: 0;
}
.max-opacity :deep(.v-list-item__prepend > .v-icon) {
  opacity: 1;
}
</style>
