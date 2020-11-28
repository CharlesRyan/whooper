<template lang="pug">
  .footer.mb-2
    p 2020 -
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

  a {
    color: #fff;
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
