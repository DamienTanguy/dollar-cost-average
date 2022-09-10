<template>
  <span>
    
    <img src="@/assets/uk.gif" class="selected" id="en" @click="switchLang('en')">
    <img src="@/assets/france.gif" id="fr" @click="switchLang('fr')">
    
    <!--<select v-model="$i18n.locale">
      <option
        v-for="(lang, i) in langs"
        :key="`lang-${i}`"
        :value="lang">
          {{ lang }}
      </option>
    </select>-->

  </span>
</template>

<!-- https://class-component.vuejs.org/guide/props-definition.html  -->
<script lang="ts">
import { Vue } from 'vue-class-component'
export default class SwitchLanguage extends Vue {
  switchLang(lang: string) {
    this.$i18n.locale = lang;
    const button_en = document.getElementById('en');
    const button_fr = document.getElementById('fr');
    if(button_en != null && button_fr != null){
      if(lang === 'en'){
        button_en.classList.add("selected");
        button_fr.classList.remove("selected");
      }
      if(lang === 'fr'){
        button_fr.classList.add("selected");
        button_en.classList.remove("selected");
      }
    }
  }
  /*data() {
    return { langs: ['en', 'fr'] }
  }*/
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

img {
    transition-duration: 0.4s;
    width: 41px;
    height: 20px;
    margin: 3px;
}

img.selected
{
  width: 59px;
  height: 32px;
}

img:hover {
    cursor: pointer;
}

</style>
