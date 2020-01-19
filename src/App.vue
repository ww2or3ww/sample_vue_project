<template>
  <v-app>
    <div id="return-to-top"></div>
    <v-navigation-drawer app v-model="drawer">
      <v-list nav dense>
        <v-list-item-group>
          <v-list-item>
            <v-list-item-title @click="onHome">HOME</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>ABOUT</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        Sample Vue Project
      </v-toolbar-title> 
    </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>

    <v-footer app>
      <v-card-title>
        <v-btn fab small class="mx-2" color="white" href="https://twitter.com/w2or3w" target="_blank">
          <v-icon>mdi-twitter</v-icon>
        </v-btn>
        <v-btn fab small class="mx-2" color="white" href="https://www.facebook.com/w2or3w" target="_blank">
          <v-icon>mdi-facebook</v-icon>
        </v-btn>
        <v-btn fab small class="mx-2" color="white" href="https://www.instagram.com/w2or3w" target="_blank">
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <p>Copyright © Sample Vue Project</p>
      </v-card-text>
    </v-footer>

    <transition name="fade">
      <v-btn fixed fab bottom right color="#BDBDBD88" style="bottom: 100px" v-show="this.isShowUp"
        v-scroll-to="{ element: '#return-to-top', duration: 1000 }"
      >
        <v-icon color="white">mdi-chevron-up</v-icon>
      </v-btn>
    </transition>

  </v-app>
</template>

<script>
import Vue from "vue";
import VueScrollTo from "vue-scrollto";
import { API, graphqlOperation } from 'aws-amplify';
import { listSampleAppsyncTables } from "./graphql/queries";
Vue.use(VueScrollTo, {
  container: "body",
  easing: "ease", 
  cancelable: true
});

export default {
  name: 'App',
  data: () => ({
    drawer: false,
    isShowUp: false,
  }),
  mounted() {
    window.addEventListener("scroll", this.onScreenEvent);
    window.addEventListener("resize", this.onScreenEvent);
    window.addEventListener("load", this.onScreenEvent);
    this.checkVersion();
  }, 
  methods:{
    onHome() {
      if(this.$route.path != '/'){
        this.$router.push({ path: '/' });
        this.checkVersion();
      }
    }, 
    
    onScreenEvent() {
      this.isShowUp = window.pageYOffset >= 32;
    }, 
    
    async checkVersion() {
      let apiResult = await API.graphql(graphqlOperation(listSampleAppsyncTables, { group : "version" }));
      let item = apiResult.data.listSampleAppsyncTables.items[0];
      let versionFromAPI = item.path;
      var versionFromCookies = Cookies.get('sub.w2or3w.work.version');
      console.log("versionFromAPI : " + versionFromAPI);
      console.log("versionFromCookies : " + versionFromCookies);
      
      Cookies.set('sub.w2or3w.work.version', versionFromAPI, { expires: 1 });
      if(versionFromAPI != versionFromCookies){
        alert(versionFromAPI);
        window.location.reload(true);
      }
    }, 
    
    
  }
};
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
