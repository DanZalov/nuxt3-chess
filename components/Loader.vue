<script setup lang="ts">
const props = defineProps<{
  loading: boolean
}>()
const waiting = ref(true)
const emit = defineEmits(['close'])
onMounted(() => {
  setTimeout(() => {
    waiting.value = false
  }, 10000)
})
function close() {
  emit('close')
  setTimeout(() => {
    waiting.value = true
  }, 200)
}
</script>

<template>
  <div class="text-center">
    <v-dialog v-model="props.loading" persistent width="auto">
      <v-card color="orange-lighten-4">
        <v-card-text>
          {{
            waiting
              ? 'Waiting for opponent..'
              : 'No opponent found. Please, try later'
          }}
          <v-progress-linear
            indeterminate
            color="Black"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn class="bg-green" @click="navigateTo('/board')">
            Back to board
          </v-btn>
          <v-btn class="bg-green" @click="close"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
