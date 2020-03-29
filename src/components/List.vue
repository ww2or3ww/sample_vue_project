<template>
  <v-container>
    <p>リスト</p>
    <router-link to="/" >link to Home</router-link>
    <hr>
    
    <v-list>
      <v-list-item v-for="data in this.dataList" :key="data.path">
        <v-list-item-content>
          <a :href="data.image" target=”_blank”>
            <v-list-item-title v-text="data.path"></v-list-item-title>
          </a>
        </v-list-item-content>
        <v-list-item-avatar>
          <v-img :src="data.image"></v-img>
        </v-list-item-avatar>
      </v-list-item>
    </v-list>
    
    <v-btn v-if="dataList.length > 0" @click="processMosaic">
      PROCESS MOSAIC
    </v-btn>
    

  </v-container>
</template>

<script>
import { Auth, API, graphqlOperation, Storage } from 'aws-amplify';
import { listSampleAppsyncTables } from "../graphql/queries";
import { onCreateSampleAppsyncTable } from "../graphql/subscriptions";
import { processApplyMosaic } from "../graphql/mutations";

/*
import axios from 'axios';
const apiUrl = "https://g7rf1pbku2.execute-api.ap-northeast-1.amazonaws.com/work/process";
const config = {headers: {
    'Content-Type': 'application/json'
}}
*/

const dataExpireSeconds = (30 * 60);
export default {
  name: 'List',
  data: () => ({
    group: null, 
    dataList: [], 
    myGuid: null, 
  }), 
  mounted: async function() {
    this.getList();
  }, 
  methods:{
    async getList() {
      this.group = this.$route.query.group;
      console.log("group : " + this.group);
      if(!this.group){
          return;
      }
      
      let apiResult = await API.graphql(graphqlOperation(listSampleAppsyncTables, { group : this.group }));
      let listAll = apiResult.data.listSampleAppsyncTables.items;
      for(let data of listAll) {
        let tmp = { path : data.path, image : "", points : data.points };
        let list = [...this.dataList, tmp];
        this.dataList = list;
        console.log("path : " + data.path);
        console.log("points : " + data.points);
        Storage.get(data.path.replace('public/', ''), 
          { level: 'public', expires: dataExpireSeconds }).then(result => {
        tmp.image = result;
          console.log("image : " + result);
        }).catch(err => console.log(err));
      }
      
      API.graphql(
          graphqlOperation(onCreateSampleAppsyncTable, { group : this.group } )
      ).subscribe({
          next: (eventData) => {
            let data = eventData.value.data.onCreateSampleAppsyncTable;
            let tmp = { path : data.path, image : "", points : data.points };
            let list = [...this.dataList, tmp];
            this.dataList = list;
            console.log("path : " + data.path);
            console.log("points : " + data.points);
            Storage.get(data.path.replace('public/', ''), 
              { level: 'public', expires: dataExpireSeconds }).then(result => {
              tmp.image = result;
              console.log("image : " + result);
            }).catch(err => console.log(err));
          }
      });
    },
    async processMosaic() {
      let pointsList = [];
      let orgKey = "";
      for(let index = 0; index < this.dataList.length; index++) {
        let data = this.dataList[index];
        if(data.points != "-"){
          pointsList.push(data.points);
        }else if(data.path.startsWith("public/processed") == false){
          orgKey = data.path;
        }
      }
      this.myGuid = this.getGUIDString(new Date());
      let requestData = { guid: this.myGuid, orgKey: orgKey, pointsList: pointsList }; 
      console.log("requestData=");
      console.log(requestData);
      
      
      let apiResult = await API.graphql(graphqlOperation(processApplyMosaic, 
        {input : {guid: this.myGuid, orgKey: orgKey, pointsList: pointsList}})
      ).catch(error => {
        console.error(error);
      });
      
      console.log("apiResult=");
      console.log(apiResult);

      /*
      const currSession = await Auth.currentSession();
      config.headers["Authorization"] = currSession.getIdToken().getJwtToken();

      axios
      .post(apiUrl, requestData, config)
      .then(response => {
          let result = response.data
          console.log(result)
      })
      .catch(error => console.log(error))*/
    }, 
    
    getGUIDString(date){
      let random = date.getTime() + Math.floor(100000 * Math.random());
      random = Math.random() * random;
      random = Math.floor(random).toString(16);
      return random;
    }, 

  }
}
</script>
