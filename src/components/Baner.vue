<template>
  <div>
      <div v-if="size == '600х200'" class="full-size">
        <el-button v-if="next" @click="nextAds" class="next" type="info">Пропустить</el-button>
        <div v-if="type == 'SVG/JPG'" :style="`width:100%;height:100%;background: url(https://api.kholobok.biz/img/ads/${link}) center no-repeat;background-size:contain`"></div>
        <iframe v-if="type == 'HTML'" style="width:100%;height:100%;border:none;" :src="`https://api.kholobok.biz/img/ads/${link}`"></iframe>
      </div>
      <div v-if="size == '468х60'" class="smol-size">
        <el-button @click="closeAds" class="close" type="info" icon="el-icon-close" circle></el-button>
        <div v-if="type == 'SVG/JPG'" :style="`width:100%;height:60px;background: url(https://api.kholobok.biz/img/ads/${link}) center no-repeat;background-size:contain`"></div>
        <iframe v-if="type == 'HTML'" style="width:100%;height:100%;border:none;" :src="`https://api.kholobok.biz/img/ads/${link}`"></iframe>
      </div>
  </div>
</template>

<script>

    
  

  export default {
    name: 'Baner',
    props: ['data'],
    data: () => ({
        link: null,
        size: null,
        type: null,

        next: false
    }),
    created(){
      let data = JSON.parse(this.data.body);
      this.link = data.body;
      this.size = data.size;
      this.type = data.type;

      if(this.size == '600х200'){
        this.$emit('stop');
      }

      setTimeout(() => {
          this.next = true;
      }, 5000);

      setTimeout(() => {
          this.$emit('close');
      }, 10000);
    },
    methods: {
      nextAds(){
        this.$emit('close'); 
      },
      closeAds(){
        this.$emit('close'); 
      }
    }
  }
</script>

<style lang='scss' scoped>
    .next{
       position: absolute;
        bottom:30px;
        right:5px;
        height: 30px;
        line-height: 18px;
        padding: 5px 20px;  
    }
    .close{
        width:25px;
        height: 25px;
        position: absolute;
        top:5px;
        right:5px; 
        background: rgba(0, 0, 0, 0.267);
        color:#fff;
        line-height: 25px;
        text-align: center;
        padding: 0;
        font-size: 12px;
    }
    .full-size{
        position: absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background: rgb(42, 126, 112);
        z-index: 9999999999999999;
    }

  .smol-size{
    position: absolute;
        margin-left: 50%;
        bottom:80px;
        left:-234px;
        width:468px;
        height:60px;
        background: rgb(141, 78, 78);
        z-index: 9999999999999999;
  }
</style>