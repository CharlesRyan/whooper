<template lang="pug">

  v-progress-circular(
    :value="0"
    size="100"
    class="ml-2"
    :indeterminate="true"
    :color="accentColor"
    class='loader'
  )

</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Loader',
  computed: {
    ...mapState({
      accentColor: (state) => state.accentColor,
    }),
  }
}
</script>

<style lang="scss" scoped>
.loader {
  position: fixed;
  top: calc(50% - 50px);
  left: calc(50% - 50px);
}
</style>
