<template>
  <div>

    <!-- new commit -->

    <div class="panel" ref="panel">
      <video
        class="video-payer" 
        v-if="vizibleHls" 
        ref="player"
        v-on:click.right.prevent>
      </video>

      <component 
        v-if="showAds" 
        @close="endAds()" 
        @play="playPlayer()" 
        @stop="pausedPlayer()" 
        :data="dataAds" 
        :is="'ads-'+adsComponent">
      </component>

      <div 
        class="panel__contener"
        v-on:mousemove="hovPlay()"
        ref="contener">

        

        <div class="panel__play-list">

          <el-select v-if="serias != null && serias.length > 1" v-model="seria" @change="changeFile()" placeholder="Select">
            <el-option
              v-for="(item, index) in serias"
              :key="index"
              :label="item.title"
              :value="item.file">
            </el-option>
          </el-select>

          <el-select v-if="sezon != null && sezon.length > 1" v-model="sezonIndex" @change="changeSezon()" placeholder="Select">
            <el-option
              v-for="(item, index) in sezon"
              :key="index"
              :label="item.title"
              :value="index">
            </el-option>
          </el-select>


          <el-select v-if="listen != null && listen.length > 1" v-model="listenIndex" @change="changeListen()" placeholder="Select">
            <el-option
              v-for="(item, index) in listen"
              :key="index"
              :label="item.title"
              :value="index">
            </el-option>
          </el-select>
          <!--   -->
        </div>
        
        <div class="panel__play" v-if="paused && !loaded" v-on:click="playPlayer()" v-html="dataStyle.playPanel.icons.icon1">Play</div>
        <div class="panel__play" v-else-if="!loaded" v-on:click="pausedPlayer()" v-html="dataStyle.playPanel.icons.icon2">Pause</div>
        <div class="panel__play" v-if="loaded" v-html="dataStyle.play.icons.icon1"></div>

        <div class="panel__menu" v-if="menu">
          <div class="panel__menu-item" v-for="(item, index) of levelsHls" :class="{'active': Hls.currentLevel == index}" v-on:click="newLevels(index)" :key="index">{{ item.height }}p</div>
          <div class="panel__menu-item" :class="{'active': Hls.currentLevel == -1}" v-on:click="newLevels(-1)">auto</div> 
        </div>

        <div class="panel__control">

          <div class="panel__control-play" v-if="paused" v-on:click="playPlayer()" v-html="dataStyle.playPanel.icons.icon1">Play</div>
          <div class="panel__control-play" v-else v-on:click="pausedPlayer()" v-html="dataStyle.playPanel.icons.icon2">Pause</div>

          <p class="panel__control-time">{{currentTime}} {{dataStyle.timePanel.duration}} {{durationTime}}</p>

          <div style="flex: 1 10 auto"></div>
          <el-slider class="panel__control-line" v-model="progress" :step="0.001" :show-tooltip="false"></el-slider>


          <div class="panel__control-volum-contener" style="position:relative">
            <div class="panel__control-level">
              <el-slider class="panel__control-level-line" vertical v-if="player" v-model="volum" :max="1" :min="0" :step="0.1" :show-tooltip="false"></el-slider>
            </div>
            <div class="panel__control-volum" v-if="muted" v-on:click="volumPlayer()" v-html="dataStyle.volumPanel.icons.icon2">mute</div>
            <div class="panel__control-volum" v-else v-on:click="mutedPlayer()" v-html="dataStyle.volumPanel.icons.icon1">volum</div>
          </div>
          

          <div class="panel__control-full" v-if="!fullScreenActive" v-on:click="fullScreenPlayer()" v-html="dataStyle.fullPanel.icons.icon1">FullScreen</div>
          <div class="panel__control-full" v-else v-on:click="notFullScreenPlayer()" v-html="dataStyle.fullPanel.icons.icon2">notFullScreen</div>

          <div class="panel__control-menu" v-on:click="menu = !menu" v-html="dataStyle.menuPanel.icons.icon1">menu</div>

        </div>


      </div>
    </div>

    
    <div id="adv"></div>
    

    <!-- <p v-on:click="getLevels">Levels</p>
    <div v-for="(item, index) of levelsHls" :key="index" v-on:click="newLevels(index)">
      {{ item.height }}
    </div>
    <div v-on:click="newLevels(-1)">
      auto
    </div> -->

    <!-- <el-slider :style="dataStyle.linePanel.stylePlay" v-model="progress" :show-tooltip="false"></el-slider> -->
  
    <!-- https://round.kholobok.biz/movies/3eb65218f284f347209d4c4c1637d7dd9a93d90b/fc1f7b55484beabddcef8ed9c67732ae:2021062013/720.mp4 -->
    <!-- https://round.kholobok.biz/movies/3eb65218f284f347209d4c4c1637d7dd9a93d90b/fc1f7b55484beabddcef8ed9c67732ae:2021062013/hls.m3u8 -->

  </div>
</template>

<script>

  let playList = null;
  let domain = null;
  let dataPlayer = null;

  if(typeof systemInfo != 'undefined'){
    console.log(systemInfo);
    playList = systemInfo.playList;
    domain = systemInfo.domain;
    dataPlayer = systemInfo.dataPlayer;
  }



  import moment from 'moment';
  import Hls from 'hls.js';
  import fullScreen from 'fullscreen';
  import axios from 'axios';


  import link from 'components/Link';
  import baner from 'components/Baner';
  import code from 'components/Code';

  



  export default {
    name: 'App',
    components: {
      adsLink: link,
      adsBaner: baner,
      adsCode: code
    },
    props: ['stylePanel', 'styles', 'video', 'playList'],

    styles() {

      let player = {width: '100vw', height: '100vh'};
      if(this.styles != null) player = this.styles;
      

      return {
        scoped: true,


        '.panel': { ...player},

        '.panel__play-list': {

          ...this.dataStyle.playList.style,

          '.el-select': { ...this.dataStyle.playList.styleSelect },
          '.el-input__inner':{ ...this.dataStyle.playList.styleInput },
          '.el-select:hover .el-input__inner': { ...this.dataStyle.playList.styleInputHover },
          '.el-select .el-input.is-focus .el-input__inner': { ...this.dataStyle.playList.styleInputFocus },
        },

        '.el-scrollbar, .el-select-dropdown': { ...this.dataStyle.playList.styleList },
        '.el-select-dropdown__item': { ...this.dataStyle.playList.styleItem },
        '.el-select-dropdown__item.selected': { ...this.dataStyle.playList.styleItemSelect },
        '.el-select-dropdown__item.hover': { ...this.dataStyle.playList.styleItemHover },

        '.panel__play': { ...this.dataStyle.play.style },
        '.panel__play:hover': { ...this.dataStyle.play.styleHover },

        '.panel__menu': { 
          ...this.dataStyle.menu.style,
          '&-item': {...this.dataStyle.menu.styleItem},
          '&-item:hover': {...this.dataStyle.menu.styleItemHov},
          '&-item.active': {...this.dataStyle.menu.styleItemActiv},
        },

        '.panel__control': {
          ...this.dataStyle.panel.style,
          '& > div': { ...this.dataStyle.panel.styleDiv},
          '& > p': { ...this.dataStyle.panel.styleDiv},

          '&-play': { ...this.dataStyle.playPanel.style },
          '&-play:hover': { ...this.dataStyle.playPanel.styleHover },

          '&-time': { ...this.dataStyle.timePanel.style },

          '&-volum': { ...this.dataStyle.volumPanel.style },
          '&-volum:hover': { ...this.dataStyle.volumPanel.styleHover },

          '&-menu': { ...this.dataStyle.menuPanel.style },
          '&-menu:hover': { ...this.dataStyle.menuPanel.styleHover },

          '&-full': { ...this.dataStyle.fullPanel.style },
          '&-full:hover': { ...this.dataStyle.fullPanel.styleHover },

          '&-level': { ...this.dataStyle.levelPanel.style },
          '&-volum-contener:hover .panel__control-level': { ...this.dataStyle.levelPanel.styleHover },
          '&-level .is-vertical .el-slider__runway': { ...this.dataStyle.levelPanel.styleLine },
          '&-level .el-slider__bar': { ...this.dataStyle.levelPanel.stylePlay },
          '&-level .el-slider__button': { ...this.dataStyle.levelPanel.stylePoint },

          '&-line': { ...this.dataStyle.linePanel.style },
          '&-line .el-slider__runway': { ...this.dataStyle.linePanel.styleLine },
          '&-line .el-slider__runway:before': { ...this.dataStyle.linePanel.styleLoad, width: this.buffer+ '%' },
          '&-line .el-slider__bar': { ...this.dataStyle.linePanel.stylePlay },
          '&-line .el-slider__button': { ...this.dataStyle.linePanel.stylePoint },
        },

      }
    },

    data: () => ({

      dataStyle: null,



      event: 'playPlayer',

      Hls: null,
      fullScreen: null,

      fullScreenActive: false,
      vizibleHls: false,
      paused: true,
      menu: false,
      muted: false,
      loaded: false,

      levelsHls: null,
      player: null,
      panel: null,

      currentTime: '0',
      durationTime: '0',
      bufferedTime: '0',
      
      volum: 1,



      listen: null,
      listenIndex: 0,
      sezon: null,
      sezonIndex: 0,
      serias: null,
      seria: null,

      adsList: null,
      showAds: false,
      adsComponent: null,
      dataAds: null,
      adNum: 0
    }),

    computed: {
      progress: {
        get: function(){
          return parseFloat(( (this.reverFormatTime(this.currentTime) / this.reverFormatTime(this.durationTime)) * 100 ).toFixed(3));
        },
        set: function(value){
          let time = Math.round( (parseFloat(value).toFixed(3) / 100) * this.reverFormatTime(this.durationTime) );
          if(this.formatTime(time) != this.currentTime){
            
            if(!isNaN(time)){
            this.player.currentTime = time;
            this.currentTime = this.formatTime(time);}
          }
        }
      },
      buffer: {
        get: function(){
          return parseFloat(( (this.reverFormatTime(this.bufferedTime) / this.reverFormatTime(this.durationTime)) * 100 ).toFixed(3));
        }
      },
    },



    async created() {

      if(this.stylePanel != null) this.dataStyle = this.stylePanel;
      if(dataPlayer != null) this.dataStyle = dataPlayer;


      eval('console.log("moev");var moevideoQueue = moevideoQueue || [];moevideoQueue.push(function () {moevideo.ContentRoll({"mode": "manual","insertAfter": "#adv","width": "auto","ignorePlayers": true});});');


      // let time = moment({hour: 0, minute: 0, seconds: 0}).format('H:m:s');
      // console.log( new Date(time) );
      // console.log( moment( new Date(time) ).format('H:m:s') );

      if(playList != null){
        this.listen = playList;
        console.log(this.listen);
        this.sezon = this.listen[this.listenIndex].folder;
        console.log(this.sezon);
        this.serias = this.sezon[this.sezonIndex].folder;
        console.log(this.serias);
        this.seria = this.serias[0].file;
        console.log(this.seria);
      }else if(this.playList != null){

        this.listen = this.playList;
        this.sezon = this.listen[this.listenIndex].folder;
        this.serias = this.sezon[this.sezonIndex].folder;
        this.seria = this.serias[0].file;
        
      }else{
        this.seria = 'https://round.kholobok.biz/movies/3eb65218f284f347209d4c4c1637d7dd9a93d90b/fc1f7b55484beabddcef8ed9c67732ae:2021062013/hls.m3u8';
      }


      await this.initHls();
      // console.log(this.seria);
    },

    async updated() {},

    watch:{
      volum: function(){ this.player.volume = this.volum;}
    },

    methods: {

      async initHls(){
        if(this.Hls != null) this.Hls.destroy();

        this.vizibleHls = Hls.isSupported();
        this.Hls = new Hls;

        await this.$nextTick(function () {

          this.fullScreen = fullScreen(this.$refs.panel);
          this.fullScreen.on('attain',() => { this.fullScreenActive = true; });
          this.fullScreen.on('release',() => { this.fullScreenActive = false; });

          this.player = this.$refs.player;
          this.panel = this.$refs.panel;
          this.Hls.loadSource(this.seria);
          this.Hls.attachMedia(this.player);

          this.Hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.player.addEventListener('loadedmetadata', () => { this.loadedMetaData(); });
            this.player.addEventListener('progress', () => { this.progressD(); });
            this.player.addEventListener('timeupdate', () => { this.timeUpdate(); }, false);

            this.player.addEventListener('waiting', () => { this.loaded = true; }); // Событие загрузки
            this.player.addEventListener('playing', () => { this.loaded = false; }); // Событие окончания загрузки
          });

          this.Hls.on(Hls.Events.ERROR, function (event, data) {
            console.log(event, data);
          });

        });
      },

      getAdsList(){
        axios.get('https://api.kholobok.biz/apishow/shows.getAds', {
          params: {
            domain: domain,
            fullTime: Math.floor(this.player.duration * 0.7)
          }
        }).then(({data}) => {
          console.log(data.data);
          this.adsList = data.data;
        });

        // countAds: 1
        // duration: 426
        // fullTime: "634" 444

        // center: Array(3)
        // countAds: 4
        // duration: 426
        // fullTime: "1800"

        // center: Array(3)
        // countAds: 3
        // duration: 600
        // fullTime: "1800"
      },



      startAd(obj){
        console.log('start ad', obj);
        this.showAds = true;

        this.dataAds = obj;
        this.adsComponent = this.dataAds.type;

        axios.get('https://api.kholobok.biz/apishow/shows.showsAd', {
          params: {
            domain,
            id: obj.id
          }
        }).then(({data}) => {
          console.log(data);
        });
      },

      endAds(){
        this.showAds = false;
      },

      timeAds(){

        let currentTime = Math.floor(this.player.currentTime);
        console.log('time', currentTime);

        // Позиция старта
        if(this.adsList.start != null && currentTime == 0) {
          console.log('start ads');
          this.startAd(this.adsList.start);
        }

        // Позиция конца
        if(this.adsList.end != null && currentTime == Math.floor(this.player.duration * 0.7) ){
          console.log('end ads');
          this.startAd(this.adsList.end);
        }


        if(this.adsList.center[this.adNum] < currentTime){
          this.adNum = this.adNum + 1;
        }

        // Показ по установленому времени
        if(this.adsList.center[this.adNum] != null && this.adsList.center[this.adNum].time == currentTime){

          console.log('center ads', this.adsList.center[this.adNum], this.adsList.center, this.adNum);

          this.startAd(this.adsList.center[this.adNum]); 
          this.adNum = this.adNum + 1;
        }

      },




      // // События плеера

      // Событие загрузки плеера
      loadedMetaData(){
        this.levelsHls = this.Hls.levels;
        this.durationTime = this.formatTime( Math.floor(this.player.duration) );
        this.getAdsList();
      },

      // Событие загрузки буфера
      progressD(){
        if(this.player.buffered.length > 0) 
        this.bufferedTime = this.formatTime( Math.floor(this.player.buffered.end(this.player.buffered.length - 1)) );
      },

      // Событие изменеия времени воспроизведения
      timeUpdate(){
        this.timeAds();
        this.currentTime = this.formatTime( Math.floor(this.player.currentTime) );
      },

      hovPlay(){
        this.$nextTick(function () {
          this.$refs.contener.classList.remove('hidden');
          setTimeout(() => {
            if(!this.paused) this.$refs.contener.classList.add('hidden');
          }, 1500);
        });
      },


      // Включить и остановить проигрывание
      playPlayer(){
        this.paused = false;
        this.player.play(); 
      },
      pausedPlayer(){
        this.paused = true;
        this.player.pause(); 
      },

      // Перевести в и вывести из полного экрана
      fullScreenPlayer(){ this.fullScreen.request(); },
      notFullScreenPlayer(){ this.fullScreen.release(); },

      // Включить и выключить звук
      volumPlayer(){ this.muted = false; this.player.muted = false; },
      mutedPlayer(){ this.muted = true; this.player.muted = true; },

      // Выбор серии
      changeFile(){ this.pausedPlayer(); this.initHls(); },

      // Выбор сезона
      changeSezon(){
        this.pausedPlayer();
        this.serias = this.sezon[this.sezonIndex].folder;
        this.seria = this.serias[0].file;
        this.initHls(); 
      },

      // Выбор озвучки
      changeListen(){
        this.pausedPlayer();
        this.sezon = this.listen[this.listenIndex].folder;
        // this.sezonIndex = 0;
        this.serias = this.sezon[0].folder;
        this.seria = this.serias[0].file;
        this.initHls();
      },


      // Выбрать / задать качество видео
      getLevels(){ console.log(this.Hls.currentLevel); },
      newLevels(index){
        // this.playPlayer();
        this.Hls.currentLevel = index;
        // this.pausedPlayer();
      },


      
      
      // Секунды в формат
      formatTime(time){
        let format = [];
        let hours = Math.floor(time / 60 / 60);
        let minutes = Math.floor(time / 60) - (hours * 60);
        let seconds = time % 60;
        if(hours != 0) {
          format.push(hours.toString());
          format.push(minutes.toString().padStart(2, '0'));
        }else{
          format.push(minutes.toString());
        }
        format.push(seconds.toString().padStart(2, '0'));
        return format.join(':');
      },

      // Формат в секунды
      reverFormatTime(time){
        let format = time.split(':');
        if(format.length == 2){
          return parseInt(format[0]*60) + parseInt(format[1]);
        }
        if(format.length == 3){
          return parseInt(format[0]*60*60) + parseInt(format[1]*60) + parseInt(format[2]);
        }
      }
      


    }
  }
  //scoped
</script>

<style lang="scss">

  body{
    margin: 0;
    padding: 0;
  }
  body *{
    
    box-sizing: border-box;
  }

  

  .panel{
    
    position: relative;
    background: rgba(0, 0, 0, 1);

    font-family: sans-serif;

    &__contener{
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      position: absolute;
      
    }
    &__contener.hidden{
      transition: opacity 0.5s ease-in-out 0.5s;
      opacity: 0;
      cursor: none;
    }

    &__control{

      & div{
        display: inline-block;

      }

      &-play{
        line-height: 20px;
        
      }
    }

  }

  .panel video{
    height: 100%;
    position: relative;
    top:50%;
    transform: translateY(-50%);
    width: 100%;
  }





  .panel__play{
    text-align: center;
    cursor: pointer;
    padding: 10px;
    width: 20px;
    height: 20px;
    box-sizing: content-box;

    transform-origin: 0% 0%;
  }

  .panel__menu{
    cursor: pointer;
  }

  .panel__control{
    box-sizing: border-box;
    align-items: center;
    display: flex;
    position: absolute;
    width: 100%;
  }
  .panel__control > div{
    cursor: pointer;
    transition: all 0.5s ease-in-out;
  }
  .panel__control > p{
    line-height: 24px;
  }

  .panel__control > div svg{
    position: relative;
    top: 2px;
    margin:0px 2px 0px 2px;
  }


  .panel__control-level{
    position: absolute;
    bottom: 100%;
    overflow: hidden;
    transition: height 0.2s ease-in-out, opacity 0.25s ease-in-out;
  }
  .panel__control-level-line{
    height: 100px;
  }
  div.panel__control-level .is-vertical div.el-slider__runway{
    margin: 0;
  }
  .panel__control-level .is-vertical .el-slider__bar{
    width: 100%;
  }
  .panel__control-level .is-vertical .el-slider__button-wrapper{
    height:4px;
    left: 50%;
    transform: translateX(-50%) translateY(50%);
    width: auto;
  }
  .panel__control-level .is-vertical .el-slider__button{
    width: 4px;
    height: 4px;

    top: -10px;
    position: relative;
  }




  .panel__control-line{
    margin: 0 !important;
    flex: 1 10 auto;
    overflow: hidden;
    cursor: default !important;
  }
  .panel__control-line .el-slider__runway{
    margin: 0;
  }
  .panel__control-line .el-slider__runway:before{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    content: '';
  }
  .panel__control-line .el-slider__bar{
    height: 100%;
  }
  .panel__control-line .el-slider__button-wrapper{
    top:calc(50% - 18px);

    width: auto;
  }
  .panel__control-line .el-slider__button{
    width: 4px;
    height: 4px;
  }


  .el-select-dropdown{
    background-color: transparent !important;
  }


  .el-select-dropdown__list{
    padding: 0;
  }
  .el-popper[x-placement^=bottom] .popper__arrow{
    top: -7px;
  }

  // .panel__control-line > div > div{
  //   position: absolute;
  //   top:calc(50% - 2px);
  //   right:-2px;
  //   width: 4px;
  //   height: 4px;
  //   border-radius: 100%;
  // }
  // .panel__control-line > div{
  //   position: absolute;
  //   top:0;
  //   left:0;
  //   height:100%;
  // }
  
</style>



