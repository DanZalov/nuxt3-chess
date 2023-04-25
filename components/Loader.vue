<script setup lang="ts">
const props = defineProps<{
  loading: boolean
}>()
// const dialog = ref(props.loading)
// watch(dialog, () => {
//   setTimeout(() => (dialog.value = false), 4000)

// })
</script>

<template>
  <div class="text-center">
    <!-- <v-btn
      :disabled="dialog"
      :loading="dialog"
      color="purple-darken-2"
      @click="dialog = true"
    >
      Start loading
    </v-btn> -->
    <v-dialog v-model="props.loading" persistent width="auto">
      <v-card color="orange-lighten-4">
        <v-card-text>
          Waiting for opponent..
          <v-progress-linear
            indeterminate
            color="Black"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
