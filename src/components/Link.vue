<template>
  <div>2234</div>
</template>

<script>
  

  export default {
    name: 'Link',
    props: ['data'],
    data: () => ({

    }),
    created(){
      console.log('open');
      window.open(this.data.body);
    },
    methods: {
      
    }
  }
</script>

<style lang='scss' scoped>
  
</style>
