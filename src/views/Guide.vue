<template>
  <v-row class="mb-4 px-16">
    <!-- page title -->
    <v-col cols="12" class="px-16 mb-4 d-flex">
      <h1 class="page-title px-5">
        User Guide
        <v-icon class="ml-2">
          mdi-book
        </v-icon>
      </h1>
      <v-spacer></v-spacer>
    </v-col>
    <!-- card list -->
    <v-col cols="12" class="px-16 d-flex flex-column">
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">Login</h2>
        <v-img :src.sync="login"> </v-img>
      </v-card>
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">Logout</h2>
        <v-img :src.sync="logout"> </v-img>
      </v-card>
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">Sign up</h2>
        <p>click <strong>reset form</strong> to clear input content</p>
        <p class="mb-8">
          click <strong>reset validation</strong> to clear validation message
          below input fields
        </p>
        <v-img :src.sync="signup"> </v-img>
      </v-card>
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">Procedure of watching a simulation</h2>
        <v-stepper class="mb-8" non-linear>
          <v-stepper-header>
            <v-stepper-step step="1">
              Start
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="2">
              Pick a simulation from the list
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">
              Play
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="4">
              Rate the simulation after watching
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="5">
              View the visualization of eye tracking data
            </v-stepper-step>
          </v-stepper-header>
        </v-stepper>
        <v-img :src.sync="watch"> </v-img>
      </v-card>
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">View records in a simulation card</h2>
        <v-img :src.sync="card"> </v-img>
      </v-card>
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">View records of watching history</h2>
        <v-img :src.sync="record"> </v-img>
      </v-card>
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">Download records from cloud storage</h2>
        <v-alert dense text type="warning" class="mb-8">
          Users can download records only after login
        </v-alert>
        <v-img :src.sync="download"> </v-img>
      </v-card>
      <v-card class="elevation-1 pa-8 my-8" dark color="#2a2a2e">
        <h2 class="mb-8">Upload records to cloud storage</h2>
        <v-alert dense text type="warning" class="mb-8">
          Users can upload records only after login
        </v-alert>
        <v-img :src.sync="upload"> </v-img>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// import MarkdownItVue from 'markdown-it-vue'

export default {
  components: {
    // MarkdownItVue,
  },

  data() {
    return {
      content: '# your markdown content',
    }
  },

  computed: {
    // url of thumbnail image
    login() {
      return process.env.BASE_URL + 'login.gif'
    },
    logout() {
      return process.env.BASE_URL + 'logout.gif'
    },
    signup() {
      return process.env.BASE_URL + 'signup.gif'
    },
    watch() {
      return process.env.BASE_URL + 'watch.gif'
    },
    record() {
      return process.env.BASE_URL + 'record.gif'
    },
    card() {
      return process.env.BASE_URL + 'card.gif'
    },
    download() {
      return process.env.BASE_URL + 'download.gif'
    },
    upload() {
      return process.env.BASE_URL + 'upload.gif'
    },
  },
}
</script>

<style scoped></style>
