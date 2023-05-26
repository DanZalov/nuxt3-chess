<script setup lang="ts">
const props = defineProps<{
  position: PositionState
  game: GameOptions
}>()

const rowsArray = ['8', '7', '6', '5', '4', '3', '2', '1']
const columnsArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const reversedRowsArray = [...rowsArray].reverse()
const reversedColumnsArray = [...columnsArray].reverse()
const chosenRowsArray = ref(rowsArray)
const chosenColumnsArray = ref(columnsArray)

watch(props.game, () => {
  chosenRowsArray.value = props.game.white ? rowsArray : reversedRowsArray
  chosenColumnsArray.value = props.game.white
    ? columnsArray
    : reversedColumnsArray
})

function backgroundColorHandler(
  row: string,
  column: string,
  captures: string[]
) {
  let bgColor =
    (+row + column.charCodeAt(0)) % 2 === 1 ? 'bg-green-lighten-5' : 'bg-green'
  for (const capture of captures) {
    if (capture === column + row) {
      bgColor += ' flamed'
    }
  }
  return bgColor
}
</script>

<template>
  <div class="chess-table unselectable">
    <v-row v-for="row of chosenRowsArray" no-gutters>
      <v-col v-for="column of chosenColumnsArray">
        <v-sheet
          class="pa-1 border position-relative"
          height="67.25px"
          width="67.25px"
          :class="
            backgroundColorHandler(row, column, position.move.possibleCaptures)
          "
          @click="clearMove(position)"
        >
          <PieceImage
            :position="position"
            :row="row"
            :column="column"
            :game="game"
          />
          <div
            v-if="row === chosenRowsArray[7]"
            class="x-coordinate text-caption"
          >
            {{ column }}
          </div>
          <div
            v-if="column === chosenColumnsArray[0]"
            class="y-coordinate text-caption"
          >
            {{ row }}
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<style>
.chess-table {
  width: 538px;
  height: 538px;
}
.flamed {
  background-position: center;
  background-size: cover;
  background-image: url('/flameCircle-300micro.png');
}
.unselectable {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  not supported by any browser */
}
.position-relative {
  position: relative;
}
.x-coordinate {
  position: absolute;
  right: 3px;
  bottom: -1px;
}
.y-coordinate {
  position: absolute;
  left: 5px;
  top: 0px;
}
</style>
