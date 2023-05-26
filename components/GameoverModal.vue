<script setup lang="ts">
const props = defineProps<{
  gameOver: boolean
  result: string
  moves: string[][]
}>()
async function copyToClipboard() {
  let movesString: string = ''
  for (const move of props.moves) {
    movesString += move[0] + ' '
    if (move[1]) {
      movesString += move[1] + ' '
    }
  }
  await navigator.clipboard.writeText(movesString)
}
async function openInNewTab(endpoint: string) {
  await copyToClipboard()
  const link = document.createElement('a')
  link.href = endpoint
  link.target = '_blank'
  link.click()
}
</script>

<template>
  <v-dialog v-model="props.gameOver" persistent width="auto">
    <v-card>
      <v-card-title class="text-h2 pa-10">
        {{ result }}
      </v-card-title>
      <v-card-actions class="d-flex justify-center">
        <v-btn
          class="bg-green"
          variant="outlined"
          @click="openInNewTab('https://lichess.org/paste')"
        >
          Analyse
        </v-btn>
        <v-btn class="bg-green" variant="outlined" @click="navigateTo('/')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
