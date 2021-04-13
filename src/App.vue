<template>
  <v-app>
    <Navbar app />
    <!-- Sizes your content based upon application components -->
    <v-main class="background-pattern">
      <!-- <scrollbar> -->
      <!-- Provides the application the proper gutter -->
      <v-container class="mt-16">
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </v-container>
      <!-- </scrollbar> -->
    </v-main>
  </v-app>
</template>

<script>
// import './utils/indexedDB.js'
import Navbar from './components/Navbar'

export default {
  name: 'App',

  components: {
    Navbar,
  },

  data: () => ({}),

  mounted() {
    // error handling
    this.eventBus.$on('error', (msg) => {
      this.eventBus.$emit('showSnackbar', msg)
    })
    this.$electron.ipcRenderer.on('error', (event, msg) => {
      this.eventBus.$emit('showSnackbarError', msg)
    })
  },

  created() {
    this.initUser()
    // hide loading page
    document.getElementById('Loading').style.display = 'none'
    // await this.$cloudbase
    //   .auth({ persistence: 'local' })
    //   .anonymousAuthProvider()
    //   .signIn()
    //   .then(() => {
    //     console.log('登录成功');
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   })
  },

  methods: {
    /**
     * initialize user login module in leancloud
     */
    initUser() {
      const currentUser = this.user.current()
      if (currentUser != null) {
        currentUser.isAuthenticated().then((authenticated) => {
          if (authenticated) {
            console.log('session token is valid')
            this.user.become(currentUser.getSessionToken()).then(
              (user) => {
                console.log(user)
              },
              (error) => {
                console.log(error)
                this.eventBus.$emit('error', error)
                this.user.logOut()
              }
            )
          } else {
            console.log('session token invalid')
            this.eventBus.$emit('error', 'Invalid session token')
            this.user.logOut()
          }
        })
      }
    },
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.page-title {
  border-left: 6px solid #1eb980;
  background-color: #1eb9801e;
}

/* smooth scrolling */
* {
  scroll-behavior: smooth;
  user-select: none;
}

.background-pattern {
  background: linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px,
    linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px,
    linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px,
    linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px,
    linear-gradient(90deg, #1b1b1b 10px, transparent 10px),
    linear-gradient(
      #1d1d1d 20%,
      #1a1a1a 20%,
      #1a1a1a 40%,
      transparent 40%,
      transparent 70%,
      #242424 70%,
      #242424
    );
  background-color: #131313;
  background-size: 20px 20px;
}
</style>
