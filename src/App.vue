<template>
  <div>

    <div class="panel" ref="panel">
      <video
        class="video-payer" 
        v-if="vizibleHls" 
        ref="player"
        v-on:click.right.prevent>
      </video>

      <component v-if="showAds" @close="showAds = false" @play="playPlayer()" @stop="pausedPlayer()" :data="dataAds" :is="'ads-'+adsComponent"></component>

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
          <div class="panel__menu-item" :class="{'active': Hls.currentLevel == index}" v-for="(item, index) of levelsHls" :key="index" v-on:click="newLevels(index)">{{ item.height }}p</div>
          <div class="panel__menu-item" :class="{'active': Hls.currentLevel == index}" v-on:click="newLevels(-1)">auto</div> 
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

  if(typeof systemInfo != 'undefined'){
    console.log(systemInfo);
    playList = systemInfo.playList;
    domain = systemInfo.domain;
  }



  import moment from 'moment';
  import Hls from 'hls.js';
  import fullScreen from 'fullscreen';
  import axios from 'axios';


  import link from 'components/Link';
  import baner from 'components/Baner';


  



  export default {
    name: 'App',
    components: {
      adsLink: link,
      adsBaner: baner
    },
    props: ['styles', 'video', 'playList'],

    styles() {

      let player = {width: '100vw', height: '100vh'};
      if(this.styles != null) player = this.styles;



      return {

        '.panel': { ...player},


        '.panel__play-list': {

          ...this.dataStyle.playList.style,

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

      dataStyle: {
        panel: {
          style:{
            color: '#fff',
            padding: '0 5px',
            background: 'rgba(255, 255, 255, 0)',
            height: '50px',
            bottom: '0',
            left: '0'
          },
          styleDiv:{
            margin: '0 8px'
          }
        },

        playPanel:{
          style:{
            color: '#fff',
            padding: '5px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '0px solid #000',
            borderRadius: '50%'
          },
          styleHover:{
            background: 'rgba(0, 0, 0, 1)',
          },
          icons:{
            icon1: '<svg width="20" height="20"><g fill-rule="nonzero" transform="translate(5, 3)"><polyline points="0.59375 0.48438 0.5625 13.51563 11.4375 7 0.59375 0.48438" fill="#ffffff"></polyline></g></svg>',
            icon2: '<svg width="20" height="20"><g fill-rule="nonzero" fill="#ffffff" transform="translate(5, 4)"><rect x="0" y="0" width="3.5" height="12" fill="#ffffff" style="fill: rgb(255, 255, 255);"></rect><rect x="6.5" y="0" width="3.5" height="12" fill="#ffffff" style="fill: rgb(255, 255, 255);"></rect></g></svg>'
          }
        },

        volumPanel:{
          style:{
            color: '#fff',
            padding: '5px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '0px solid #000',
            borderRadius: '50%'
          },
          styleHover:{
            background: 'rgba(0, 0, 0, 1)',
          },
          icons:{
            icon1: '<svg width="20" height="20"><g fill="#ffffff" transform="translate(3, 2)"><polygon fill-rule="nonzero" points="8.8817842e-16 4.3746 8.8817842e-16 10.62539 3.10029 10.62539 7.74143 15 7.74419 0 3.10237 4.37461 1.77635684e-15 4.37461 1.77635684e-15 4.3746" fill="#ffffff"></polygon><path d="M10.44167,3.62185 C10.17405,3.31419 9.74434,3.31419 9.47808,3.62343 C9.21251,3.93268 9.21251,4.43332 9.47944,4.74335 L9.47944,4.74178 C10.06713,5.42512 10.42941,6.36234 10.42941,7.40396 C10.42941,8.44479 10.06781,9.37885 9.4808,10.06219 C9.2125,10.36985 9.2125,10.87049 9.47944,11.18131 C9.61223,11.33554 9.78657,11.41304 9.9609,11.41304 C10.13591,11.41304 10.31024,11.33554 10.44303,11.18131 C11.27519,10.21641 11.79138,8.87583 11.7907,7.40396 C11.79138,5.92892 11.27315,4.58676 10.44167,3.62186 L10.44167,3.62185 Z" idhide="pjs_volume_element1" fill="#ffffff"></path><path d="M11.99413,1.86278 C11.72289,2.17257 11.72289,2.67489 11.99413,2.98309 C12.99747,4.13271 13.61608,5.71413 13.61608,7.46829 C13.61608,9.22085 12.99747,10.80149 11.99552,11.9519 C11.72427,12.26089 11.72427,12.76243 11.99552,13.07221 C12.13045,13.22671 12.3076,13.30435 12.48543,13.30435 C12.66256,13.30435 12.83971,13.22671 12.97464,13.07221 C14.22569,11.63894 15.00138,9.65345 15,7.46829 C15.00069,5.28154 14.225,3.29446 12.97187,1.86278 C12.69993,1.55299 12.2633,1.55299 11.99413,1.86278 L11.99413,1.86278 Z" idhide="pjs_volume_element2" fill="#ffffff"></path></g></svg>',
            icon2: '<svg width="20" height="20"><g fill-rule="nonzero" fill="#000000" transform="translate(3, 2)"><polygon points="8.8817842e-16 4.3746 8.8817842e-16 10.62539 3.10029 10.62539 7.74143 15 7.74419 0 3.10237 4.37461 1.77635684e-15 4.37461 1.77635684e-15 4.3746" fill="#ffffff" style="fill: rgb(255, 255, 255);"></polygon><path d="M11.9267767,6.64744791 L9.87932726,4.59999847 L9,5.47932573 L11.0474494,7.52677517 L9,9.57422461 L9.87932726,10.4535519 L11.9267767,8.40610243 L13.9742261,10.4535519 L14.8535534,9.57422461 L12.806104,7.52677517 L14.8535534,5.47932573 L13.9742261,4.59999847 L11.9267767,6.64744791 Z" fill="#ffffff" style="fill: rgb(255, 255, 255);"></path></g></svg>'
          }
        },
        timePanel:{
          style:{
            color: '#fff',
            padding: '5px 14px 5px 14px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '0px solid #000',
            borderRadius: '20px',
            fontSize: '14px'
          },
          duration:'/'
        },
        menuPanel:{
          style:{
            color: '#fff',
            padding: '5px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '0px solid #000',
            borderRadius: '20px'
          },
          styleHover:{
            background: 'rgba(0, 0, 0, 1)',
          },
          icons:{
            icon1: '<svg width="20" height="20"><g fill-rule="nonzero" transform="translate(2, 2)"><path d="M12.5176036,14.5995982 L11.8913249,12.408042 C12.0748622,12.2470857 12.2471403,12.0748421 12.4097532,11.8905347 L14.6001245,12.5166878 C14.8311603,12.1802803 15.0299924,11.8229223 15.2079001,11.4519067 L13.5777858,9.87443978 C13.6558739,9.64265338 13.7234998,9.40684231 13.7717953,9.16377877 L15.9686033,8.61327723 C15.9847153,8.41046035 16,8.20683651 16,7.99919809 C16,7.79155968 15.9839082,7.58872262 15.9686033,7.38591582 L13.7717953,6.83541428 C13.7226826,6.59235074 13.6550567,6.35652958 13.5777858,6.12474318 L15.2087072,4.54728635 C15.0299924,4.17705752 14.8311603,3.81891277 14.6001245,3.48248508 L12.4097532,4.10784135 C12.2479474,3.92434084 12.0748622,3.75210737 11.8913249,3.590334 L12.5176036,1.3995848 C12.1811286,1.16941229 11.8228918,0.969803035 11.4518018,0.791941088 L9.87401862,2.4225356 C9.64298276,2.34446315 9.40631729,2.27765775 9.16321511,2.22856491 L8.61340021,0.0313802823 C8.40973554,0.0160885729 8.20687798,0 7.99919793,0 C7.79151788,0 7.58864015,0.0160885729 7.38579268,0.0313802823 L6.83518076,2.22856491 C6.59206848,2.27765775 6.35620004,2.34446315 6.12436716,2.4225356 L4.54659402,0.791941088 C4.17629095,0.972233973 3.81888151,1.17101611 3.48238635,1.40200565 L4.10866504,3.59274476 C3.92512773,3.75371118 3.75206271,3.92676169 3.59105392,4.10944516 L1.39986544,3.48329203 C1.16882958,3.81971972 0.969997497,4.17786447 0.792099885,4.54889016 L2.42302136,6.12635708 C2.34573028,6.35814348 2.27811446,6.59395455 2.22901177,6.83701809 L0.0313865746,7.38751963 C0.0160917989,7.59033652 0,7.79396035 0,8.00080191 C0,8.20764346 0.0160917989,8.41125721 0.0313865746,8.61488105 L2.22901177,9.16538259 C2.27811446,9.40844612 2.34573028,9.64424711 2.42302136,9.8760436 L0.792099885,11.4535105 C0.969997497,11.8237393 1.16882958,12.1818841 1.39986544,12.5183118 L3.59105392,11.8921586 C3.75205262,12.0764661 3.92512773,12.2478926 4.10866504,12.409666 L3.48238635,14.6012222 C3.81888151,14.8313947 4.17709807,15.030197 4.54740113,15.2088659 L6.12517427,13.5782713 C6.35700715,13.6563438 6.5928756,13.7239561 6.83598787,13.772242 L7.38659979,15.9686096 C7.58945735,15.9847184 7.79311193,16 8.00080207,16 C8.20849221,16 8.41133967,15.9839114 8.61500434,15.9686096 L9.16481924,13.772242 C9.40793152,13.7231492 9.64458689,13.6555469 9.87562275,13.5782713 L11.453406,15.2088659 C11.8228918,15.028573 12.1811185,14.8297908 12.5176036,14.5995982 L12.5176036,14.5995982 Z M7.99999496,10.7356172 C6.48902044,10.7356172 5.26382416,9.51066656 5.26382416,7.99999496 C5.26382416,6.48932335 6.48902044,5.26517965 7.99999496,5.26517965 C9.51096947,5.26517965 10.7353586,6.48933344 10.7353586,7.99999496 C10.7353586,9.51065647 9.51095939,10.7356172 7.99999496,10.7356172 Z" fill="#ffffff"></path></g></svg>'
          }
        },
        fullPanel:{
          style:{
            color: '#fff',
            padding: '5px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '0px solid #000',
            borderRadius: '20px'
          },
          styleHover:{
            background: 'rgba(0, 0, 0, 1)',
          },
          icons:{
            icon1: '<svg width="20" height="20"><g fill-rule="nonzero" transform="translate(-1, -1)"><path d="M10.9007191,14.8361421 L7.70806906,12.1869821 C7.52690906,12.0367021 7.38790906,11.8662321 7.11408906,11.8662321 C6.74284906,11.8662321 6.52010906,12.1727221 6.52010906,12.4602121 L6.52010906,14.2421521 L2.36223906,14.2421521 C2.03554906,14.2421521 1.76825906,14.5094421 1.76825906,14.8361321 L1.76825906,16.0240921 C1.76825906,16.3507821 2.03554906,16.6180721 2.36223906,16.6180721 L6.52010906,16.6180721 L6.52010906,18.4000121 C6.52010906,18.6875021 6.74284906,18.9939921 7.11408906,18.9939921 C7.38791906,18.9939921 7.52690906,18.8235221 7.70806906,18.6732421 L10.9007191,16.0240821 C11.1282091,15.8387621 11.2719591,15.6944221 11.2719591,15.4301021 C11.2719591,15.1657821 11.1282191,15.0220421 10.9007191,14.8361221 L10.9007191,14.8361421 Z" transform="translate(6.520109, 15.430112) rotate(-225.000000) translate(-6.520109, -15.430112) " fill="#ffffff"></path><path d="M19.9050304,5.9347708 L16.7123904,3.2856108 C16.5312204,3.1353308 16.3922304,2.9648608 16.1184104,2.9648608 C15.7471704,2.9648608 15.5244204,3.2713508 15.5244204,3.5588408 L15.5244204,5.3407808 L11.3665604,5.3407808 C11.0398704,5.3407808 10.7725804,5.6080808 10.7725804,5.9347708 L10.7725804,7.1227308 C10.7725804,7.4494208 11.0398704,7.7167108 11.3665604,7.7167108 L15.5244204,7.7167108 L15.5244204,9.4986508 C15.5244204,9.7861408 15.7471704,10.0926308 16.1184104,10.0926308 C16.3922304,10.0926308 16.5312204,9.9221608 16.7123904,9.7718808 L19.9050304,7.1227308 C20.1325304,6.9374108 20.2762704,6.7930708 20.2762704,6.5287508 C20.2762704,6.2644308 20.1325304,6.1206808 19.9050304,5.9347708 L19.9050304,5.9347708 Z" transform="translate(15.524425, 6.528746) rotate(-45.000000) translate(-15.524425, -6.528746) " fill="#ffffff"></path></g></svg>', 
            icon2: '<svg width="20" height="20"><g fill-rule="nonzero" fill="#ffffff" transform="translate(-1, -1)"><path d="M7.70806906,12.1869821 C7.52690906,12.0367021 7.38790906,11.8662321 7.11408906,11.8662321 C6.74284906,11.8662321 6.52010906,12.1727221 6.52010906,12.4602121 L6.52010906,14.2421521 L2.36223906,14.2421521 C2.03554906,14.2421521 1.76825906,14.5094421 1.76825906,14.8361321 L1.76825906,16.0240921 C1.76825906,16.3507821 2.03554906,16.6180721 2.36223906,16.6180721 L6.52010906,16.6180721 L6.52010906,18.4000121 C6.52010906,18.6875021 6.74284906,18.9939921 7.11408906,18.9939921 C7.38791906,18.9939921 7.52690906,18.8235221 7.70806906,18.6732421 L10.9007191,16.0240821 C11.1282091,15.8387621 11.2719591,15.6944221 11.2719591,15.4301021 C11.2719591,15.1657821 11.1282191,15.0220421 10.9007191,14.8361221 L7.70806906,12.1869821 Z" transform="translate(6.520109, 15.430112) rotate(-45.000000) translate(-6.520109, -15.430112) " fill="#ffffff"></path><path d="M19.9050304,5.9347708 L16.7123904,3.2856108 C16.5312204,3.1353308 16.3922304,2.9648608 16.1184104,2.9648608 C15.7471704,2.9648608 15.5244204,3.2713508 15.5244204,3.5588408 L15.5244204,5.3407808 L11.3665604,5.3407808 C11.0398704,5.3407808 10.7725804,5.6080808 10.7725804,5.9347708 L10.7725804,7.1227308 C10.7725804,7.4494208 11.0398704,7.7167108 11.3665604,7.7167108 L15.5244204,7.7167108 L15.5244204,9.4986508 C15.5244204,9.7861408 15.7471704,10.0926308 16.1184104,10.0926308 C16.3922304,10.0926308 16.5312204,9.9221608 16.7123904,9.7718808 L19.9050304,7.1227308 C20.1325304,6.9374108 20.2762704,6.7930708 20.2762704,6.5287508 C20.2762704,6.2644308 20.1325304,6.1206808 19.9050304,5.9347708 L19.9050304,5.9347708 Z" transform="translate(15.524425, 6.528746) rotate(-225.000000) translate(-15.524425, -6.528746) " fill="#ffffff"></path></g></svg>'
          }
        },

        levelPanel:{
          style:{
            padding: '10px 15px 10px 15px',
            background: 'rgba(0, 0, 0, 1)',
            border: '1px solid #000',
            borderRadius: '20px',
            marginBottom: '5px',

            height: '0',
            opacity: '0'
          },
          styleHover:{
            height: '122px',
            opacity: '1'
          },
          styleLine:{
            width: '4px',
            background: 'rgba(255, 255, 255, 0.3)'
          },
          stylePlay:{
            background: 'rgba(255, 255, 255, 0.6)'
          },
          stylePoint:{
            background: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1)',
            border: '0px solid #000',
            borderRadius: '4px'
          },
        },


        linePanel:{
          style:{
            padding: '0px 15px 0px 15px',
            position: 'absolute',
            width: '100%',
            background: 'rgba(255, 255, 255, 0)',
            bottom: '45px',
            left: '0'
          },
          styleLine:{
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)'
          },
          stylePlay:{
            background: 'rgba(255, 255, 255, 0.6)'
          },
          styleLoad:{
            background: 'rgba(255, 255, 255, 0.3)'
          },
          stylePoint:{
            background: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1)',
            border: '0px solid #000',
            borderRadius: '4px'
          },
        },

        play:{
          style:{
            margin: '0',
            padding: '10px',
            border: '0px solid #fff',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            position: 'absolute',

            transform: 'scale(2) translateX(-50%) translateY(-50%)',
            top: '50%',
            left: '50%'
          },
          styleHover:{
            transform: 'scale(2.2) translateX(-50%) translateY(-50%)',
          },
          icons: {
            icon1: '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="20px" height="20px" viewBox="0 0 128 128" xml:space="preserve"> <g> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="1"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.03" transform="rotate(30 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.09" transform="rotate(60 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.17" transform="rotate(90 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.25" transform="rotate(120 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.35" transform="rotate(150 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.44" transform="rotate(180 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.55" transform="rotate(210 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.65" transform="rotate(240 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.75" transform="rotate(270 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.84" transform="rotate(300 64 64)"/> <path d="M40.73 13.1l-4.04-7A63.67 63.67 0 0 1 61.5.06v8a55.83 55.83 0 0 0-20.77 5.05z" fill="#ffffff" fill-opacity="0.92" transform="rotate(330 64 64)"/> <animateTransform attributeName="transform" type="rotate" values="0 64 64;30 64 64;60 64 64;90 64 64;120 64 64;150 64 64;180 64 64;210 64 64;240 64 64;270 64 64;300 64 64;330 64 64" calcMode="discrete" dur="1080ms" repeatCount="indefinite"> </animateTransform> </g> </svg>'
          }
        },

        menu:{
          style: {
            margin: '0',
            border: '0px solid #fff',
            borderRadius: '5px',
            color: '#444444',
            background: 'rgba(255, 255, 255, 1)',
            position: 'absolute',
            bottom: '65px',
            right: '15px',
            fontSize: '14px'
          },
          styleItem: {
            padding: '5px 10px',
          },
          styleItemHov: {
            background: 'rgba(0, 0, 0, 0.25)',
          },
          styleItemActiv: {
            background: 'rgba(0, 0, 0, 0.15)',
          }
        },

        playList:{
          style:{},
          styleInput:{
            margin: '5px',
            color: '#ffffff',
            borderRadius: '50px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)'
          },
          styleInputHover:{
            background: 'rgba(0, 0, 0, 1)'
          },
          styleInputFocus:{},
          styleList:{
            borderRadius: '5px',
            background: '#888888',
            border: 'none',
          },
          styleItem:{
            color: '#ffffff'
          },
          styleItemHover:{
            background: 'rgba(255, 255, 255, 0.4)'
          },
          styleItemSelect:{
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.4)'
          },
        }
        
      },



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
      dataAds: null
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
      // let time = moment({hour: 0, minute: 0, seconds: 0}).format('H:m:s');
      // console.log( new Date(time) );
      // console.log( moment( new Date(time) ).format('H:m:s') );

      axios.get('https://api.kholobok.biz/apishow/shows.getAds', {
        params: {
          domain: domain
        }
      }).then(({data}) => {
        console.log(data);
        this.adsList = data.data;
      });

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

      }else{
        this.seria = 'https://round.kholobok.biz/movies/3eb65218f284f347209d4c4c1637d7dd9a93d90b/fc1f7b55484beabddcef8ed9c67732ae:2021062013/hls.m3u8';
      }

      this.initHls();
    },

    

    async updated() {},

    watch:{
      volum: function(){
        this.player.volume = this.volum;
      }
    },

    methods: {

      initHls(){
        if(this.Hls != null) this.Hls.destroy();

        this.vizibleHls = Hls.isSupported();
        this.Hls = new Hls;

        
        this.$nextTick(function () {
          this.fullScreen = fullScreen(this.$refs.panel);

          this.fullScreen.on('attain',() => {
            this.fullScreenActive = true;
          });

          this.fullScreen.on('release',() => {
            this.fullScreenActive = false;
          });

          
          this.player = this.$refs.player;
          this.panel = this.$refs.panel;
          this.Hls.loadSource(this.seria);
          this.Hls.attachMedia(this.player);

          console.log('load',this.player);

          this.Hls.on(Hls.Events.MANIFEST_PARSED,() => {

            // Событие загрузки плеера
            this.player.addEventListener('loadedmetadata', () => {
              this.levelsHls = this.Hls.levels;
              this.durationTime = this.formatTime( Math.floor(this.player.duration) );
            });

            // Событие загрузки буфера
            this.player.addEventListener('progress', () => {
              if(this.player.buffered.length > 0) 
                this.bufferedTime = this.formatTime( Math.floor(this.player.buffered.end(this.player.buffered.length - 1)) );
            });

            // Событие изменеия времени воспроизведения
            this.player.addEventListener('timeupdate', () => {
              this.currentTime = this.formatTime( Math.floor(this.player.currentTime) );
            }, false);

            // Событие загрузки
            this.player.addEventListener('waiting', () => {
              this.loaded = true;
            });
            // Событие окончания загрузки
            this.player.addEventListener('playing', () => {
              this.loaded = false;
            });

          });
        });
      },

      eventPlayer(name, params){
        if(name == undefined) return;
        this[name](params);
      },


      hovPlay(){
        this.$refs.contener.classList.remove('hidden');
        setTimeout(() => {
          if(!this.paused) this.$refs.contener.classList.add('hidden');
        }, 1500);
      },


      // Включить и остановить проигрывание
      playPlayer(){
        if(this.currentTime == 0) this.startAd();
        this.paused = false;
        this.player.play(); 
      },
      pausedPlayer(){
        this.paused = true;
        this.player.pause(); 
      },

      // Перевести в и вывести из полного экрана
      fullScreenPlayer(){
        this.fullScreen.request();
      },
      notFullScreenPlayer(){
        this.fullScreen.release();
      },

      // Включить и выключить звук
      volumPlayer(){
        this.muted = false;
        this.player.muted = false; 
      },
      mutedPlayer(){
        this.muted = true;
        this.player.muted = true; 
      },

      // Выбор серии
      changeFile(){
        this.pausedPlayer();
        this.initHls();
      },

      // Выбор сезона
      changeSezon(){
        this.pausedPlayer();
        this.serias = this.sezon[this.sezonIndex].folder;
        this.seria = this.serias[0].file;
        this.initHls(); 
      },

      changeListen(){
        this.pausedPlayer();
        this.sezon = this.listen[this.listenIndex].folder;
        // this.sezonIndex = 0;
        this.serias = this.sezon[0].folder;
        this.seria = this.serias[0].file;
        this.initHls();
      },



      getLevels(){
        console.log(this.Hls.currentLevel);
      },

      newLevels(index){
        this.playPlayer();
        this.Hls.currentLevel = index;
        this.pausedPlayer();
      },




      startAd(){
        console.log('start ads');
        console.log(this.adsList.start);
        this.dataAds = this.adsList.start;
        console.log(this.dataAds);
        this.adsComponent = this.dataAds.type;
        console.log(this.adsComponent);
        this.showAds = true;
      },

      
      

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


