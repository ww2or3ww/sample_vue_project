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

  </v-container>
</template>

<script>
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { listSampleAppsyncTables } from "../graphql/queries";
import { onCreateSampleAppsyncTable } from "../graphql/subscriptions";

const dataExpireSeconds = (30 * 60);
export default {
  name: 'List',
  data: () => ({
    group: null, 
    dataList: [], 
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
        let tmp = { path : data.path, image : "" };
        let list = [...this.dataList, tmp];
        this.dataList = list;
        console.log("path : " + data.path);
        Storage.get(data.path.replace('public/', ''), { expires: dataExpireSeconds }).then(result => {
          tmp.image = result;
          console.log("image : " + result);
        }).catch(err => console.log(err));
      }
      
      API.graphql(
          graphqlOperation(onCreateSampleAppsyncTable, { group : this.group } )
      ).subscribe({
          next: (eventData) => {
            let data = eventData.value.data.onCreateSampleAppsyncTable;
            let tmp = { path : data.path, image : "" };
            let list = [...this.dataList, tmp];
            this.dataList = list;
            console.log("path : " + data.path);
            Storage.get(data.path.replace('public/', ''), { expires: dataExpireSeconds }).then(result => {
              tmp.image = result;
              console.log("image : " + result);
            }).catch(err => console.log(err));
          }
      });
    }, 
  }
}
</script>
