<template>
  <div class="views-news">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'news',
  data() {
    return {
      msg: 'News Components',
    }
  },
  created() {
    console.log(this.msg)
  },
}
</script>

<style lang="less" scoped>
.views-news {
  background-color: aliceblue;
}
</style>
