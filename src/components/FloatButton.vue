<template>
  <div class="d-flex">
    <!-- upload button -->
    <!-- <v-badge color="warning" :value="upload" dot overlap class="mr-3">
      <v-btn small icon @click="checkUser(0)"
        ><v-icon>mdi-cloud-upload</v-icon></v-btn
      >
    </v-badge> -->
    <!-- download button -->
    <v-badge color="warning" :value="download" dot overlap>
      <v-btn small icon @click="checkUser(1)"
        ><v-icon>mdi-cloud-download</v-icon></v-btn
      >
      <!-- <v-icon @click="dialog = true">mdi-cloud-upload</v-icon> -->
    </v-badge>
    <!-- upload dialog -->
    <v-dialog v-model="dialogUpload" max-width="500" persistent>
      <v-card color="#2a2a2e">
        <v-card-title class="headline">
          Upload the local records?
        </v-card-title>
        <v-card-text
          >This will upload your local records data (including visualization
          files of eye tracking) to the cloud storage. You could download and
          review them next time you reinstall or run this App in a new
          machine</v-card-text
        >
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="uploadRecords">
            Accept
          </v-btn>
          <v-btn color="warning darken-1" text @click="dialogUpload = false">
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- download dialog -->
    <v-dialog v-model="dialogDownload" max-width="500" persistent>
      <v-card color="#2a2a2e">
        <v-card-title class="headline">
          Download the records from cloud?
        </v-card-title>
        <v-card-text
          >This will download your records data in cloud (including
          visualization files of eye tracking) and save them into the local
          storage.
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="downloadRecords">
            Accept
          </v-btn>
          <v-btn color="warning darken-1" text @click="dialogDownload = false">
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  getUnsyncedRecords,
  getSyncedRecords,
  syncRecord,
  insertRecord,
} from '../utils/indexedDB.js'

export default {
  data() {
    return {
      upload: 0,
      download: 0,
      dialogUpload: false,
      dialogDownload: false,
    }
  },

  async mounted() {
    this.eventBus.$on('newRecord', () => {
      this.upload++
    })
    this.eventBus.$on('checkUpdate', () => {
      this.update()
    })

    this.update()
  },

  methods: {
    async update() {
      // calculate number of records to be uploaded
      let records = await getUnsyncedRecords()
      this.upload = records.length

      // calculate number of records to be downloaded
      let recordId = (await getSyncedRecords()).map(function(item) {
        return item.uid
      })
      const query = new this.leanCloud.Query('EyeTracking')
      query.equalTo('userId', localStorage.getItem('userName'))
      query.find().then((records) => {
        records.forEach((value, index, array) => {
          if (!recordId.includes(value.id)) {
            this.download++
          }
        })
      })
    },

    async uploadRecords() {
      this.eventBus.$emit('startProgress')
      let records = await getUnsyncedRecords()
      records.forEach((value, index, array) => {
        if (value.uid == '') {
          // create record instance
          const eyeTracking = new this.leanCloud.Object('EyeTracking')
          eyeTracking.set('userId', value.user)
          eyeTracking.set('simulation', value.simulation)
          eyeTracking.set('visualization', value.visualization)
          eyeTracking.set('userScore', value.userScore)
          eyeTracking.set('calculatedScore', value.calculatedScore)
          eyeTracking.set('date', value.date)
          // save instance into leancloud
          eyeTracking.save().then(
            (eyeTracking) => {
              console.log('upload success')
              syncRecord(value.id, eyeTracking.id)
            },
            (error) => {
              console.log('upload failed')
              this.eventBus.$emit('showSnackbarError', 'Upload failed')
            }
          )
          this.uploadFile(value.visualization)
          this.upload--
        }
      })
      this.dialogUpload = false
      this.eventBus.$emit('updateRecord')
      this.eventBus.$emit('finishProgress')
      this.eventBus.$emit('showSnackbar', 'Upload records successfully!')
    },

    async uploadFile(fileName) {
      try {
        const arg = this.$electron.ipcRenderer.sendSync('copyMap', fileName)
        const data = { base64: arg }
        const file = new this.leanCloud.File(fileName + '.txt', data)
        await file.save()
      } catch (error) {
        this.eventBus.$emit('showSnackbarError', 'File uploading failed')
      }
      this.sleep(5000)
    },

    sleep(numberMillis) {
      var now = new Date()
      var exitTime = now.getTime() + numberMillis
      while (true) {
        now = new Date()
        if (now.getTime() > exitTime) return
      }
    },

    async downloadRecords() {
      this.eventBus.$emit('startProgress')
      let recordId = (await getSyncedRecords()).map(function(item) {
        return item.uid
      })

      try {
        // configure query
        const query = new this.leanCloud.Query('EyeTracking')
        query.equalTo('userId', localStorage.getItem('userName'))
        const records = await query.find()
        let fileRecords = []
        records.forEach((value, index, array) => {
          if (!recordId.includes(value.id)) {
            insertRecord({
              uid: value.id,
              user: localStorage.getItem('userName'),
              simulation: value.get('simulation'),
              visualization: value.get('visualization'),
              userScore: value.get('userScore'),
              calculatedScore: value.get('calculatedScore'),
              date: value.get('date'),
            })
            fileRecords.push(value.get('visualization'))
            this.download--
          }
        })
        this.downloadFile(fileRecords)
        this.dialogDownload = false
        this.eventBus.$emit('updateRecord')
        this.eventBus.$emit('finishProgress')
        this.eventBus.$emit('showSnackbar', 'Download records successfully!')
      } catch (error) {
        this.eventBus.$emit('showSnackbarError', error)
      }
    },

    async downloadFile(fileRecords) {
      try {
        const queries = []
        fileRecords.forEach((value) => {
          const query = new this.leanCloud.Query('_File')
          query.equalTo('name', value + '.txt')
          queries.push(query)
        })
        const query = this.leanCloud.Query.or(...queries)
        const records = await query.find()

        records.forEach((value) => {
          let fileUrl = value.attributes.url
          let fileName = value.attributes.name
          fileName = fileName.substring(0, fileName.indexOf('.'))
          // listen to ipcMain event
          this.$electron.ipcRenderer.on(
            'mapDownloaded' + fileName,
            (event, arg) => {}
          )
          this.$electron.ipcRenderer.send('downloadMap', fileUrl, fileName)
        })
      } catch (error) {
        this.eventBus.$emit('showSnackbarError', error)
      }
    },

    /**
     * type: 0 upload, 1 download
     */
    checkUser(type) {
      const currentUser = this.user.current()
      if (currentUser == null) {
        this.eventBus.$emit('showSnackbarError', 'Please login/signup first!')
        return
      } else {
        type == 0 ? (this.dialogUpload = true) : (this.dialogDownload = true)
      }
    },
  },
}
</script>

<style scoped>
.float-group {
  position: fixed;
  bottom: 30px;
  right: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 150px;
  z-index: 999;
}
</style>
