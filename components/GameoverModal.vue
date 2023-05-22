<script setup lang="ts">
const props = defineProps<{
  gameOver: boolean
  result: string
}>()
</script>

<template>
  <v-dialog v-model="props.gameOver" persistent width="auto">
    <v-card>
      <v-card-title class="text-h2 pa-10">
        {{ result }}
      </v-card-title>
      <v-card-actions class="d-flex justify-center">
        <v-btn class="bg-green" variant="outlined" @click="navigateTo('/')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
