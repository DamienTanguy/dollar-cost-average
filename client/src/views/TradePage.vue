<template>
  <div class="trade">
	<TradeTable />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import TradeTable from '@/components/TradeTable.vue' // @ is an alias to /src

@Options({
  components: {
    TradeTable
  }
})
export default class TradePage extends Vue {}
</script>

<style scoped>
.trade {
	display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
}
</style>
