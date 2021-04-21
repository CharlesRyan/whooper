<template lang="pug">
.loader
  v-progress-circular(
    :value="0"
    size="100"
    class="ml-2"
    :indeterminate="true"
    :color="accentColor"
    :width="7"
    class='loader__circle'
  )

</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Loader',
  computed: {
    ...mapState({
      accentColor: (state) => state.accentColor
    })
  }
}
</script>

<style lang="scss" scoped>
.loader {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
  
  &__circle {
    position: fixed;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
  }
}
</style>
