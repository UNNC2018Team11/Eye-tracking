<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card class="pa-6" color="#2a2a2e">
      <v-card-title>
        <span class="headline">Login</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- username -->
          <v-text-field
            v-model="name"
            :counter="10"
            :rules="nameRules"
            label="Name"
            required
            clearable
            prepend-icon="mdi-account"
          ></v-text-field>
          <!-- password -->
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="Password"
            required
            clearable
            prepend-icon="mdi-lock"
            :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPwd ? 'text' : 'password'"
            counter
            @click:append="showPwd = !showPwd"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-alert v-model="warning" dense text type="error">
        Login failed! Check if your username and password match
      </v-alert>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="mr-2"
          :disabled="!valid || loading"
          color="primary"
          @click="validate"
          outlined
          :loading="loading"
        >
          Submit
        </v-btn>
        <v-btn color="disabled" @click="dialog = false" outlined>
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      dialog: false,
      valid: true,
      name: '',
      nameRules: [
        (v) => !!v || 'Name is required',
        (v) => (v && v.length <= 10) || 'Name must be less than 10 characters',
      ],
      password: '',
      passwordRules: [
        (v) => !!v || 'Password is required',
        (v) => v.length >= 8 || 'Min 8 characters',
      ],
      showPwd: false,
      warning: false,
    }
  },

  mounted() {
    this.eventBus.$on('login', () => {
      this.dialog = true
    })
  },

  methods: {
    /**
     * check login information
     */
    validate() {
      if (this.$refs.form.validate()) {
        // logout before login
        this.user.logOut()
        this.warning = false
        this.user.logIn(this.name, this.password).then(
          (user) => {
            console.log('login successfully')
            localStorage.setItem('userName', this.user.current().getUsername())
            localStorage.setItem('userEmail', this.user.current().getEmail())
            this.eventBus.$emit('updateUserInfo')
            this.eventBus.$emit('checkUpdate')
            this.eventBus.$emit('showSnackbar', 'Login successfully!')
            this.dialog = false
          },
          (error) => {
            console.log('login failed')
            this.warning = true
          }
        )
      }
    },
  },
}
</script>

<style scoped></style>
