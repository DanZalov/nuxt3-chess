<script setup lang="ts">
const props = defineProps<{
  pawnPromotion: boolean
  isWhite: boolean
}>()
const dialog = ref(props.pawnPromotion)
const emit = defineEmits(['pawnPromotion'])
function close(letter: string) {
  dialog.value = false
  emit('pawnPromotion', letter)
}
</script>

<template>
  <v-row justify="center" class="w-0">
    <v-dialog v-model="dialog" persistent width="auto" class="d-flex flex-row">
      <v-sheet class="border" scroll-strategy="none">
        <div v-if="props.isWhite" class="d-flex flex-row align-center">
          <div class="image-container bg-green-lighten-5">
            <img
              src="/Light-queen.svg"
              alt="light queen"
              @click="close('wq')"
            />
          </div>
          <div class="image-container bg-green">
            <img src="/Light-rook.svg" alt="light rook" @click="close('wr')" />
          </div>
          <div class="image-container bg-green-lighten-5">
            <img
              src="/Light-bishop.svg"
              alt="light bishop"
              @click="close('wb')"
            />
          </div>
          <div class="image-container bg-green">
            <img
              src="/Light-knight.svg"
              alt="light knight"
              @click="close('wn')"
            />
          </div>
        </div>
        <div v-else class="d-flex flex-row align-center">
          <div class="image-container bg-green-lighten-5">
            <img src="/Dark-queen.svg" alt="dark queen" @click="close('bq')" />
          </div>
          <div class="image-container bg-green">
            <img src="/Dark-rook.svg" alt="dark rook" @click="close('br')" />
          </div>
          <div class="image-container bg-green-lighten-5">
            <img
              src="/Dark-bishop.svg"
              alt="dark bishop"
              @click="close('bb')"
            />
          </div>
          <div class="image-container bg-green">
            <img
              src="/Dark-knight.svg"
              alt="dark knight"
              @click="close('bn')"
            />
          </div>
        </div>
      </v-sheet>
    </v-dialog>
  </v-row>
</template>

<style scoped>
.image-container {
  width: 67.25px;
  height: 67.25px;
  cursor: grab;
  display: flex;
  justify-content: center;
  align-items: center;
}
img {
  width: 58px;
  height: 58px;
}
</style>
