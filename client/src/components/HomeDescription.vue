<template>
  <div class="hello">
    <h1>{{ $t('dollar cost average') }}</h1>
    <p>
      {{ $t('open-source project to calculate your average buy and sell of your crypto asset.') }}<br>
      {{ $t('for each crypto asset, you will know:') }}<br>
    </p>
    <table class="table">
      <tr><td>{{ $t('token number') }}</td></tr>
      <tr><td>{{ $t('price balance') }}</td></tr>
      <tr><td>{{ $t('buy price average') }}</td></tr>
      <tr><td>{{ $t('sell price average') }}</td></tr>
      <tr><td>{{ $t('token price average') }}</td></tr>
      <tr><td>{{ $t('market price') }}</td></tr>
    </table>
    <h3>{{ $t('supported platform:') }}</h3>
    <ul>
      <li>Coinbase</li>
      <li>Coinbase Pro</li>
    </ul>
    <h3>{{ $t('how to use the application:') }}</h3><br>
    <table class="table">
      <tr>
        <td>1.</td>
        <td>{{ $t('go to') }} <a href="https://help.coinbase.com/en/exchange/managing-my-account/how-to-create-an-api-key" target="_blank">Coinbase</a> {{ $t('and') }} <a href="https://help.coinbase.com/en/pro/other-topics/api/how-do-i-create-an-api-key-for-coinbase-pro" target="_blank">Coinbase Pro</a> {{ $t('and get your api keys (your api keys are not kept by the application).') }}</td>
      </tr>
      <tr>
        <td>2.</td>
        <td>{{ $t('go to form tab.') }}</td>
      </tr>
      <tr>
        <td>3.</td>
        <td>{{ $t('fill in the form with your api keys and wait for the result.') }}</td>
      </tr>
      <tr>
        <td>4.</td>
        <td>{{ $t('once processing is complete, you will be automatically redirected to the trade page where you can see your data.') }}</td>
      </tr>
    </table>
    <h3>{{ $t('source code') }}</h3>
    <ul>
      <li><a href="https://github.com/DamienTanguy/dollar-cost-average" target="_blank">{{ $t('gitHub repository') }}</a></li>
    </ul>
    <h3>Contact</h3>
    <ul>
      <li>damientanguy.pro@gmail.com</li>
    </ul>
    <h3>Version 1.0.0</h3>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'

export default class HomeDescription extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
.table {
    display: flex;
    flex-direction: column;
    align-content: center;
    flex-wrap: wrap;
}
.table tr{
  display: flex;
  justify-content: flex-start;
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
  color: white;
}
</style>
