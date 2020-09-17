<template>
  <div class="content">
    <a style="" ref="adsLink" id="adslink" @click="open" :href="url" target="_blank" rel="noopener noreferrer"></a>
    <!-- linc -->
  </div>
</template>

<script>
  

  export default {
    name: 'Link',
    props: ['data'],
    data: () => ({

    }),
    created(){
      console.log('Link', this.data);
      // window.open(this.data.body);
      

      this.$nextTick(function () {

        let link1 = document.getElementById('adslink');
        let link2 = this.$refs.adsLink;


        let event = new Event("click");
        
        setTimeout(() => {
          link1.dispatchEvent(event);
          this.$emit('stop');
        }, 1000);
        
        link1.addEventListener('click', () => {
          console.log('click');
          window.open(this.url);
        });

      });


    },

    computed: {
      url: function(){
        console.log('http://' + this.data.body);
        return 'http://' + this.data.body;
      }
    },


    methods: {
      open(){
        // console.log('click');

      }
    }

  }
</script>

<style lang='scss' scoped>
  .content{
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
