<template>
  <div class="views-home">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      msg: 'Home Components',
    }
  },
  created() {
    console.log(this.msg)
  },
}
</script>

<style lang="less" scoped>
.views-home {
  background-color: aliceblue;
}
</style>
