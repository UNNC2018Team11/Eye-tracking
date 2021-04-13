<template>
  <div>
    <!-- thumbnail card -->
    <v-card
      class="elevation-1"
      color="#2a2a2e"
      height="300"
      @click="dialog = true"
    >
      <v-img class="" height="200px" :src.sync="thumbnail"> </v-img>
      <v-card-title class="mt-4">
        {{ name }}
      </v-card-title>
    </v-card>

    <!-- detail dialog -->
    <v-dialog v-model="dialog" width="900" persistent>
      <v-card>
        <v-img class="" height="400px" :src.sync="thumbnail"> </v-img>
        <v-card-title class="mt-4 text-h4">
          {{ name }}
        </v-card-title>
        <v-card-text class="mb-4 text--secondary text-body-1">
          {{ description }}
        </v-card-text>
        <v-expand-transition>
          <!-- record table -->
          <v-data-table
            dark
            v-if="showRecord"
            :headers="headers"
            :items="items"
            :items-per-page="5"
            class="elevation-1 mb-12"
            item-key="number"
            show-expand
          >
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                <v-btn
                  class="mx-4 my-2"
                  color="primary"
                  @click="
                    showChart(
                      item.userScore,
                      item.calculatedScore,
                      item.visualization
                    )
                  "
                >
                  Visualization
                  <v-icon right>mdi-eye-check</v-icon>
                </v-btn>
                <v-btn class="mx-4 my-2" color="primary" @click="upload(item)">
                  Upload
                  <v-icon right>mdi-cloud-upload</v-icon>
                </v-btn>
              </td>
            </template>
          </v-data-table>
        </v-expand-transition>
        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            class="mr-4 px-4"
            color="primary"
            :loading="loading"
            :disabled="loading"
            large
            @click="play"
          >
            Play
            <v-icon right>mdi-play-circle</v-icon>
          </v-btn>
          <v-btn class="mr-4 px-4" color="warning" large @click="showRecords">
            Records
            <v-icon right>mdi-history</v-icon>
          </v-btn>
          <v-btn class="px-4" color="disabled" large @click="dialog = false">
            Close
            <v-icon right>mdi-close-circle</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- rating dialog -->
    <v-dialog v-model="rateDialog" persistent>
      <v-card class="elevation-16 pa-4 mx-auto" width="500">
        <v-card-title class="headline">
          Rate your watching experience
        </v-card-title>
        <v-card-text>
          If you enjoy this simulation, please take a few seconds to rate your
          experience with the simulation. It really helps!
          <v-slider
            class="mt-12"
            v-model="rating"
            step="10"
            thumb-label
            ticks
          ></v-slider>
          <!-- <div class="text-center mt-12">
            <v-rating
              v-model="rating"
              background-color="warning"
              color="warning"
              hover
              half-increments
            ></v-rating>
          </div> -->
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-space-between mt-4">
          <v-btn
            color="primary"
            text
            @click="showChart(false, false, generatedFile)"
          >
            Rate Now
          </v-btn>
          <v-btn text @click="rateDialog = false">
            No Thanks
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { insertRecord, getRecordsBySimulation } from '../utils/indexedDB.js'
import uploadUtil from '../utils/upload.js'
import { format } from 'fecha'

export default {
  props: {
    name: {
      type: String,
      default: 'unknown',
    },
    description: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      rating: 0,
      score: 0,

      dialog: false,
      rateDialog: false,
      loading: false,
      showRecord: false,

      headers: [
        { text: 'No.', value: 'number' },
        { text: 'User', value: 'user' },
        { text: 'Simulation', value: 'simulation' },
        { text: 'User Score', value: 'userScore' },
        { text: 'Calculated Score', value: 'calculatedScore' },
        { text: 'Date', value: 'date' },
        { text: 'Uploaded', value: 'sync' },
        { text: '', value: 'data-table-expand' },
      ],
      items: [],

      generatedFile: '',
    }
  },

  mixins: [uploadUtil],

  computed: {
    // url of thumbnail image
    thumbnail() {
      return process.env.BASE_URL + this.name + '.png'
    },
  },

  mounted() {
    // console.log(this.thumbnail);
  },

  methods: {
    /**
     * play selected simulation
     */
    play() {
      this.loading = true
      this.eventBus.$emit('startProgress')
      // listen to ipcMain event
      this.$electron.ipcRenderer.on('success' + this.name, (event, score) => {
        this.saveRecord()
        this.loading = false
        this.eventBus.$emit('finishProgress')
        this.score = score
        this.rateDialog = true
      })
      let fileName = this.name + Date.now()
      fileName = fileName.replace(/\s*/g, '')
      this.generatedFile = fileName
      this.$electron.ipcRenderer.send('play', this.name, fileName)

      // this.$electron.ipcRenderer.send(
      //   'download',
      //   'https://6772-grp2020-4glv8fo5cd87cf9a-1302562267.tcb.qcloud.la/calc.py?sign=0a48a152394001da0e724f5a02ed9544&t=1613720364'
      // )

      // this.$electron.ipcRenderer.send('run')
      // this.$cloudbase
      //   .downloadFile({
      //     fileID:
      //       'cloud://grp2020-4glv8fo5cd87cf9a.6772-grp2020-4glv8fo5cd87cf9a-1302562267/calc.py',
      //   })
      //   .then((res) => {
      //     console.log(res)
      //   })
      // this.$cloudbase
      //   .getTempFileURL({
      //     fileList: ['cloud://grp2020-4glv8fo5cd87cf9a.6772-grp2020-4glv8fo5cd87cf9a-1302562267/calc.py'],
      //   })
      //   .then((res) => {
      //     // fileList 是一个有如下结构的对象数组
      //     // [{
      //     //    fileID: 'cloud://webtestjimmy-5328c3.7765-webtestjimmy-5328c3-1251059088/腾讯云.png', // 文件 ID
      //     //    tempFileURL: '', // 临时文件网络链接
      //     //    maxAge: 120 * 60 * 1000, // 有效期
      //     // }]
      //     console.log(res.fileList)
      //     this.$electron.ipcRenderer.send('download', res.fileList[0].tempFileURL)
      //   })
      //   this.$cloudbase
      //     .callFunction({
      //       // 云函数名称
      //       name: 'eye-tracking',
      //       // 传给云函数的参数
      //       data: {
      //       },
      //     })
      //     .then((res) => {
      //       console.log(res)
      //     })
      //     .catch(error)
    },

    /**
     * load records of selected simulation
     */
    async showRecords() {
      this.items = []
      let records = await getRecordsBySimulation(this.name)
      let count = 1
      records.forEach((value, index, array) => {
        this.items.push({
          number: count++,
          user: value.user,
          userScore: value.userScore,
          calculatedScore: value.calculatedScore,
          date: value.date,
          sync: value.uid == '' ? 'No' : 'Yes',
          visualization: value.visualization,
          id: value.id,
        })
      })
      this.showRecord = !this.showRecord
    },

    async saveRecord() {
      // generate unique filename
      // let fileName = this.name + Date.now()
      // fileName = fileName.replace(/\s*/g, '')
      // this.generatedFile = fileName
      // listen to ipcMain event
      // this.$electron.ipcRenderer.on('renamed' + fileName, () => {
      //   insertRecord({
      //     uid: '',
      //     user: localStorage.getItem('userName'),
      //     simulation: this.name,
      //     visualization: fileName,
      //     userScore: this.rating,
      //     calculatedScore: this.score,
      //     date: format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
      //   })
      //   this.eventBus.$emit('newRecord')
      //   this.eventBus.$emit('updateRecord')
      //   this.showChart(false, false, fileName)
      // })
      // this.$electron.ipcRenderer.sendSync('rename', fileName)
      await insertRecord({
        uid: '',
        user: localStorage.getItem('userName'),
        simulation: this.name,
        visualization: fileName,
        userScore: this.rating,
        calculatedScore: this.score,
        date: format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
      })
      this.eventBus.$emit('newRecord')
      this.eventBus.$emit('updateRecord')
    },

    /**
     * show visualization of selected record
     */
    showChart(rating, score, fileName) {
      if (rating) {
        this.rating = rating
      }
      if (score) {
        this.score = score
      }
      this.eventBus.$emit('startProgress')
      // listen to ipcMain event
      this.$electron.ipcRenderer.on('mapLoaded' + fileName, (event, arg) => {
        this.$router.push({
          name: 'Visualization',
          params: {
            name: this.name,
            rating: this.rating,
            score: this.score,
            map: arg,
          },
        })
      })
      this.$electron.ipcRenderer.send('loadMap', fileName)
    },
  },
}
</script>

<style scoped></style>
