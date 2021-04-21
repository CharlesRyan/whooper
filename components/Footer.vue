<template lang="pug">
  .footer.mb-2
    //- p &copy; 2021
    a(href="https://charlesryan.dev" target="_blank") 
      img(src="/favicon.png" alt="a logo of the letters C and R combined, standing for Charles Ryan")

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
