<template>
  <div class="views-dynamic">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'dynamic',
  data() {
    return {
      msg: 'Dynamic Components',
    }
  },
  created() {
    console.log(this.msg)
  },
}
</script>

<style lang="less" scoped>
.views-dynamic {
  color: aliceblue;
}
</style>
