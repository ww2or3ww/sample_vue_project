<template>
  <v-container>
    <p>Mail Form</p>

    <ValidationObserver ref="observer" v-slot="{ validate, reset, invalid }">
      <ValidationProvider v-slot="{ errors }" name="name" rules="required|max:25">
        <v-text-field
          label="Name"
          v-model="name"
          :counter="25"
          :error-messages="errors"
          required
        ></v-text-field>
      </ValidationProvider>
      
      <ValidationProvider v-slot="{ errors }" name="email" rules="required|email">
        <v-text-field
          label="E-mail"
          v-model="email"
          :error-messages="errors"
          required
        ></v-text-field>
      </ValidationProvider>
      
      <ValidationProvider v-slot="{ errors }" name="contens" rules="required|max:300">
        <v-textarea
          label="Message"
          v-model="message"
          :error-messages="errors"
          :counter="300"
          rows="8"
          required
        ></v-textarea>
      </ValidationProvider>

      <v-btn @click="onSubmit" :disabled="invalid">submit</v-btn>
      <v-btn @click="onValidate">validate</v-btn>
      <v-btn @click="onClear">clear</v-btn>
    </ValidationObserver>
    
  </v-container>
</template>

<script>
import { required, email, max } from "vee-validate/dist/rules"
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from "vee-validate"
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { processSendMail } from "../graphql/mutations";

setInteractionMode("aggressive");

extend("required", {
  ...required,
  message: "{_field_} can not be empty",
});

extend("max", {
  ...max,
  message: "{_field_} may not be greater than {length} characters",
});

extend("email", {
  ...email,
  message: "Email must be valid",
});

export default {
  name: "Mail",

  components: {
    ValidationProvider,
    ValidationObserver,
  },
  
  data: () => ({
    name: "", 
    email: "", 
    message: "", 
  }), 
  
  methods:{
    async onSubmit() {
      alert(this.name + " / " + this.email + " / " + this.message);
      let apiResult = await API.graphql(graphqlOperation(processSendMail, 
        {input : {name: this.name, email: this.email, message: this.message}})
      ).catch(error => {
        console.error(error);
      });
      console.log("apiResult=");
      console.log(apiResult);
    }, 
    onValidate(){
      this.$refs.observer.validate();      
    }, 
    onClear(){
      this.name = "";
      this.email = "";
      this.message = "";
      this.$refs.observer.reset();
    }
  }
}
</script>