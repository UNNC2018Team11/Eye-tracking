<template>
  <v-row class="mb-4">
    <!-- page title -->
    <v-col cols="12" class="d-flex mb-8">
      <h1 class="page-title px-5">
        {{ name }}
        <v-icon class="ml-2">
          mdi-eye
        </v-icon>
      </h1>
      <v-spacer></v-spacer>
    </v-col>
    <!-- user score -->
    <v-col cols="6" class="d-flex justify-center">
      <v-card class="pa-4 overflow-hidden elevation-1" max-height="700" color="#2a2a2e">
        <v-card-text>
          <p class="display-1 primary--text font-weight-bold">
            User Score
          </p>
          <p class="subtitle-1 text--secondary">
            The user score is supposed to be given by the user after simulation
            watching. Generally, the higher the user score is, the more
            interests the user may show in a particular simulation.
          </p>
          <div class="d-flex justify-center">
            <GaugeChart ref="gauge" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <!-- calculated score -->
    <v-col cols="6" class="d-flex justify-center">
      <v-card class="pa-4 overflow-hidden elevation-1" max-height="700" color="#2a2a2e">
        <v-card-text>
          <p class="display-1 primary--text font-weight-bold">
            Calculated Score
          </p>
          <p class="subtitle-1 text--secondary">
            The calculated score is computed by the program according to an
            algorithm. Generally, the higher the calculated score is, the higher
            the quality of the simulation is supposed to be.
          </p>
          <div class="d-flex justify-center">
            <GaugeChart ref="gauge2" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <!-- heatmap -->
    <v-col cols="12" class="d-flex justify-center">
      <v-card class="pa-4 overflow-hidden elevation-1" max-height="900" color="#2a2a2e">
        <v-card-text>
          <p class="display-1 primary--text font-weight-bold">
            Heatmap of Eye Movements
          </p>
          <p class="subtitle-1 text--secondary">
            The heatmap below depicts the duration of eye gazing at different
            areas on the screen. The screen is abstracted into a 24x10 grid,
            each small colored block of which indicates how long the user has
            looked at that area. Generally, the darker the block is, the longer
            the user has gazed at that point.
          </p>
          <div class="d-flex justify-center">
            <Heatmap ref="heatmap" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import GaugeChart from '../components/GaugeChart'
import Heatmap from '../components/Heatmap'

export default {
  components: {
    GaugeChart,
    Heatmap,
  },

  data() {
    return {
      name: 'Visualization',
    }
  },

  mounted() {
    // this.initScore()
    // this.initHeatmap()
    // this.eventBus.$on('newRecord', this.updateChart)
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.params.name) {
        vm.name = `Visualization for ${to.params.name}`
      }
      if (to.params.rating) {
        vm.$refs.gauge.option.series[0].data[0].value = to.params.rating / 100
      }
      if (to.params.score) {
        vm.$refs.gauge2.option.series[0].data[0].value = to.params.score / 100
      }
      if (to.params.map) {
        vm.$refs.heatmap.option.series[0].data = to.params.map.map(function(
          item
        ) {
          // formatting map data
          return [item[1], item[0], item[2] || '-']
        })
      }
      vm.eventBus.$emit('finishProgress')
    })
  },

  methods: {},
}
</script>

<style scoped></style>
