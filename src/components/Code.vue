<template>
  <div class="content">
    <!-- code -->
  </div>
</template>

<script>
  

  export default {
    name: 'Code',
    props: ['data'],
    data: () => ({

    }),
    created(){
      // console.log('Code', this.data);
      // this.$emit('stop');
    },
    methods: {
      
    }
  }
</script>

<style lang='scss' scoped>
  .content{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: rgb(34, 180, 199);
    z-index: 9999999999999999;
  }
  
</style>