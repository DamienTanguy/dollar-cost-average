<template>
  <div class="home">
    <HomeDescription />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import HomeDescription from '@/components/HomeDescription.vue' // @ is an alias to /src

@Options({
  components: {
    HomeDescription
  }
})
export default class Home extends Vue {}
</script>
