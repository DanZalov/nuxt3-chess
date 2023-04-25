<script setup lang="ts">
const props = defineProps<{
  position: PositionState
}>()
onMounted(() => {
  const myElement = document.querySelector('#movesHistoryTable') as HTMLElement
  myElement.scrollTop = myElement.scrollHeight
})
watch(props.position.history, () => {
  const myElement = document.querySelector('#movesHistoryTable') as HTMLElement
  setTimeout(() => {
    myElement.scrollTop = myElement.scrollHeight
  }, 0)
})
</script>

<template>
  <div class="v-table ml-5 border">
    <div>
      <div class="d-flex flex-row">
        <div class="v-col col-left text-left">White</div>
        <div class="v-col col-right-head text-left">Black</div>
      </div>
    </div>
    <div id="movesHistoryTable">
      <div
        v-for="(item, index) in props.position.history"
        :key="index + item[0]"
        class="d-flex flex-row"
      >
        <div class="v-col col-left py-0">{{ item[0] }}</div>
        <div class="v-col py-0">{{ item[1] }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-table {
  width: 200px;
  height: 538px;
}
.col-right-head {
  margin-right: 16px;
  border-right: solid 1px rgb(175, 172, 172);
}
.v-col {
  width: 100px;
  border-bottom: solid 1px rgb(175, 172, 172);
}
.col-left {
  border-right: solid 1px rgb(175, 172, 172);
}
#movesHistoryTable {
  height: 488px;
  overflow-y: scroll;
}
</style>
