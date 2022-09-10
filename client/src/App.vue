<template>
  <div id="nav">
    <router-link to="/">{{ $t('home') }}</router-link>
    <router-link to="/form">{{ $t('form') }}</router-link>
    <router-link to="/trade">{{ $t('trade') }}</router-link>
    <SwitchLanguage class="language" />
  </div>
  <router-view/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import SwitchLanguage from '@/components/SwitchLanguage.vue'

@Options({
  components: {
    SwitchLanguage
  }
})

export default class App extends Vue {}

</script>

<style>
body {
  background: -webkit-linear-gradient(left, #25c481, #25b7c4);
  background: linear-gradient(to right, #25c481, #25b7c4);
  color: white;
  font-size: 12px;
}
input, select {
  background-color: #d5d5d5;
  color: #464646;
  border: none;
  margin-left: 5px;
}
button {
  color: black;
  background-color: #d5d5d5;
  border: none;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
#nav {
  padding: 30px;
  display: flex;
  justify-content: flex-start;
}
#nav a {
  font-weight: bold;
  color: white;
  padding: 0 0 0 10px;
  text-decoration: none;
}
#nav a.router-link-exact-active {
  color: #504f4f;
}
.language {
  display: inline;
  position: fixed;
  padding: 20px;
  right: 0px;
  top: 0px;
}

@media only screen and (min-width: 550px) {
  #nav {
    justify-content: center;
  }
}

@media only screen and (min-width: 800px) {
  body {
    font-size: 16px;
  }
}

</style>
