<template>
  <div class="content">
    <div id="vast" class="vast"></div>
  </div>
</template>

<script>
  
  import VASTPlayer from '~/assets/js/vendor/vast-player2';
  import axios from 'axios';

  export default {
    name: 'Vast',
    props: ['data'],
    data: () => ({

    }),
    created(){
      console.log('Vast', this.data);
      this.$emit('stop');

      this.$nextTick(function () {
        let player = new VASTPlayer(document.getElementById('vast'), { vast: { maxRedirects: 1 }});

        player.load(this.data.body)
        .then(function startAd() {
          return player.startAd();
        }).catch((reason) => {
          setTimeout(function() { throw reason; }, 0);
        });

        player.once('AdStarted', function() {
          console.log('AdStarted');
        });
        

        player.once('AdVideoStart', () => {
          console.log('AdVideoStart', this.data);

          axios.get('https://api.kholobok.biz/apishow/shows.showsAd', {
            params: {
              domain: this.data.domain,
              id: this.data.id
            }
          }).then(({data}) => {
            console.log(data);
          });
        });
        
        player.once('AdVideoComplete', function() {
          console.log('AdVideoComplete');
        });


        player.once('AdStopped', () => {
          console.log('AdStopped');
          this.$emit('play');
          this.$emit('close'); 
        });
      });

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
    background: #000000;
    z-index: 9999999999999999;
  }

  .vast{
    width: 100%;
    height: 100%;
  }
  
</style>