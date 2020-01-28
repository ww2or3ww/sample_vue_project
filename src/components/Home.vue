<template>
  <v-container>
    <p>ホーム 0128B</p>
    <router-link to="about" >link to About</router-link>
    <hr>
    <v-btn @click="selectFile">
      SELECT A FILE !!
    </v-btn>
    <v-btn @click="onBtnUpdate">
      UPDATE
    </v-btn>
    <input style="display: none" 
      ref="input" type="file" 
      @change="uploadSelectedFile()">
      
      <span class="wrap" v-text="text"></span>

  </v-container>
</template>

<script>
import Vue from 'vue'
import { Auth, Storage } from 'aws-amplify';
import { API, graphqlOperation } from 'aws-amplify';
import { listSampleAppsyncTables } from "../graphql/queries";

export default {
  name: 'Home',
  data: () => ({
    loginid: "sample-vue-project-user", 
    loginpw: "sample-vue-project-user", 
    text: "", 
    newLine: `

    `
  }), 
  mounted: async function() {
    this.login();
  }, 
  methods:{
    login() {
      console.log("login.");
      Auth.signIn(this.loginid, this.loginpw)
        .then((data) => {
          if(data.challengeName == "NEW_PASSWORD_REQUIRED"){
            console.log("new password required.");
            data.completeNewPasswordChallenge(this.loginpw, {}, 
              {
                onSuccess(result) {
                    console.log("onSuccess");
                    console.log(result);
                },
                onFailure(err) {
                    console.log("onFailure");
                    console.log(err);
                }
              }
            );
          }
          console.log("login successfully.");
        }).catch((err) => {
          console.log("login failed.");
          console.log(err);
        });
    },
    
    selectFile() {
      if(this.$refs.input != undefined){
        this.$refs.input.click();
      }
    }, 
    
    async onBtnUpdate() {
      let apiResult = await API.graphql(graphqlOperation(listSampleAppsyncTables, { group : "version" }));
      let item = apiResult.data.listSampleAppsyncTables.items[0];
      let versionFromAPI = item.path;
      var versionFromCookies = Cookies.get('sub.w2or3w.work.version');
      console.log("versionFromAPI : " + versionFromAPI);
      console.log("versionFromCookies : " + versionFromCookies);
      this.text += ("versionFromAPI : " + versionFromAPI + " --- ");
      this.text += ("versionFromCookies : " + versionFromCookies + " --- "  );
      
      Cookies.set('sub.w2or3w.work.version', versionFromAPI, { expires: 1 });
      if(versionFromAPI != versionFromCookies){
        console.log("version updated. reloading...");
        this.text += ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
        this.text += ("versionFromAPI : " +  versionFromAPI + "---");
        this.text += ("versionFromCookies : " + versionFromCookies + "---");
  
        this.text += ("window.navigator : " + window.navigator)
        this.text += ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
        this.text += ("window.navigator.serviceWorker : " + window.navigator.serviceWorker)
        this.text += ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
        
        window.navigator.serviceWorker.getRegistration()
          .then(registration => {
          this.text += "--- registration is -->";
          this.text += (registration + " <-- ");
        });
      
        window.navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          this.text += "--- regstration list are ---";
          this.text += (registrations + " --- ");
          this.text += (registrations.length + "(counts)");
          for(let registration of registrations) {
            this.text += " ----- ";
            this.text += registration;
            registration.unregister();
          }
        });
        
        window.location.reload(true);
      }
    }, 
    
    uploadSelectedFile() {
      let file = this.$refs.input.files[0];
      if(file == undefined){
        return;
      }
      console.log(file);

      let dt = new Date();
      let dirName = this.getDirString(dt);
      let filePath = dirName + "/" + file.name;
      Storage.put(filePath, file, {
          level: 'protected'
      }).then(result => {
        console.log(result);
      }).catch(err => console.log(err));
      
      this.$router.push({ path: 'list', query: { group: dirName }});
    }, 
    
    getDirString(date){
      let random = date.getTime() + Math.floor(100000 * Math.random());
      random = Math.random() * random;
      random = Math.floor(random).toString(16);
      return "" + 
        ("00" + date.getUTCFullYear()).slice(-2) + 
        ("00" + (date.getMonth() + 1)).slice(-2) + 
        ("00" + date.getUTCDate()).slice(-2) + 
        ("00" + date.getUTCHours()).slice(-2) + 
        ("00" + date.getUTCMinutes()).slice(-2) + 
        ("00" + date.getUTCSeconds()).slice(-2) + 
        "-" + random;
    }, 
  }
}
</script>

