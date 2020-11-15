<template lang="pug">
  .footer.mb-2
    p Built with 
    img(src="https://nuxtjs.org/logos/nuxt-icon.png")
    p by
    a(href="https://charlesryan.dev") Charles

</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  align-items: center;

  img,
  a {
    margin: 0 3px;
  }

  p {
    margin: 0;
  }

  img {
    width: auto;
    height: 30px;
  }
}
</style>
