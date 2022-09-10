<template>
  <div class="form">
    <form id="form">
      <h2>{{ platform }}</h2>
      <p>
        <label for="key">{{ $t('key') }}:</label>
        <input type="text" id="key" class="key" name="key" v-model="key">
      </p>
      <p>
        <label for="secret">{{ $t('secret key') }}:</label>
        <input type="text" id="secret" name="secret" v-model="secret">
      </p>
      <p v-if="platform === 'Coinbase Pro'">
        <label for="passphrase">{{ $t('passphrase') }}:</label>
        <input type="text" id="passphrase" name="passphrase" v-model="passphrase">
      </p>
    </form>
  </div>
</template>

<!-- https://class-component.vuejs.org/guide/props-definition.html  -->
<script lang="ts">
// import Vue from 'vue'
// import { Prop } from 'vue-property-decorator'
// import Component from 'vue-class-component'
import { Options, Vue } from 'vue-class-component'

/* https://stackoverflow.com/questions/64262860/vue-typescript-import-errors-with-class-based-decorators */
@Options({
  props: {
    platform: String
  }
})

// @Component()
export default class Form extends Vue {
  // platform!: string
  data() {
    return {
      key : '',
      secret : '',
      passphrase : ''
    }
  }
  /*mounted() {
    console.log('mounted');
  }*/
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
