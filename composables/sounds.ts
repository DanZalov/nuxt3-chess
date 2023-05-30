let soundsLib: SoundsLib
if (process.client) {
  soundsLib = reactive({
    move: new Audio('/move-self.mp3'),
    capture: new Audio('/capture.mp3'),
  })
}
export const useSounds = () => {
  const sounds = soundsLib
  return { sounds }
}
