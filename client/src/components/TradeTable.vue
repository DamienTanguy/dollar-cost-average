<template>
  <div>    
    <table cellpadding="0" cellspacing="0" border="0" id="main-table">
        <thead>
            <tr>
                <th>{{ $t('crypto asset') }}</th>
                <th>{{ $t('token number') }}</th>
                <th>{{ $t('price balance') }} ($)</th>
                <th>{{ $t('buy price avg.') }} ($)</th>
                <th>{{ $t('sell price avg.') }} ($)</th>
                <th>{{ $t('token price avg.') }} ($)</th>
                <th>{{ $t('market price') }} ($)</th>
                <th>{{ $t('profit/loss') }} ?</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="trade in state.trade" :key="state.trade.currency">
                <td>{{ trade.currency }}</td>
                <td>{{ formatToken(trade.token_balance) || 0 }}</td>
                <td>
                  <span v-if="trade.price_balance < 0">{{ $t('realized profit') }}: {{ Math.abs(formatPrice(trade.price_balance)) }}</span>
                  <span v-else>{{ formatPrice(trade.price_balance) || 0 }}</span>
                </td>
                <td>{{ formatPrice(trade.price_buy_average) }}</td>
                <td>{{ formatPrice(trade.price_sell_average) || 0 }}</td>
                <td>{{ formatPrice(trade.price_token_average) || 0 }}</td>
                <td>{{ trade.current_market_price }}</td>
                <td>
                  <span v-if="trade.price_token_average < trade.current_market_price">{{ $t('in profit') }}</span>
                  <span v-else>{{ $t('in loss') }}</span>
                </td>
            </tr>
        </tbody>
    </table>
    <select v-model="selectedCurrency">
      <option v-for="name in state.currencyList" :key="state.currencyList">{{ name }}</option>
    </select>
    <div v-if="selectedCurrency !== ''" class="trade-details-container">
      <!--<div v-if="detailsTotal.token_buy !== 0">-->
      <div v-if="selectedCurrencyTrades[0].token_buy !== 0" class="details-container">
        <h2>{{ $t('buy panel') }}</h2>
        <table cellpadding="0" cellspacing="0" border="0" class="table-details">
          <thead>
            <tr>
              <th @click="sortByColumn('created_at')">
                  <span v-if="sortColumn == 'created_at'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('date') }}</span>
              </th>
              <th @click="sortByColumn('platform')">
                  <span v-if="sortColumn == 'platform'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('platform') }}</span>
              </th>
              <th @click="sortByColumn('trade_type')">
                  <span v-if="sortColumn == 'trade_type'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('trade') }}</span>
              </th>
              <th @click="sortByColumn('token')">
                  <span v-if="sortColumn == 'token'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('token') }}</span>
              </th>
              <th @click="sortByColumn('price')">
                  <span v-if="sortColumn == 'price'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('paid price') }} ($)</span>
              </th>
              <th @click="sortByColumn('token_price')">
                  <span v-if="sortColumn == 'token_price'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('market price') }} ($)</span>
              </th>
              <th @click="sortByColumn('details')">
                  <span v-if="sortColumn == 'details'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('details') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="dt in sortTradesDetails" :key="dt.created_at" v-show="dt.side === 'buy' ">
              <!--<tr v-for="dt in details[0].trade_list" :key="dt.created_at" v-show="dt.side === 'buy' ">-->
                  <td>{{ formatDate(dt.created_at) }}</td>
                  <td>{{ dt.platform }}</td>
                  <td>{{ dt.trade_type }}</td>
                  <!--<td>{{ formatToken(dt.token_buy) }}</td>
                  <td>{{ formatPrice(dt.paid_price) }} {{ dt.stablecoin }}</td>-->
                  <td>{{ formatToken(dt.token) }}</td>
                  <td>{{ formatPrice(dt.price) }} {{ dt.stablecoin }}</td>
                  <td>{{ formatPrice(dt.token_price) }}</td>
                  <td>{{ dt.trade_details }}</td>
              </tr>
          </tbody>
          <tfoot>
              <tr>
                <td>{{ $t('total') }}:</td>
                <td></td>
                <td></td>
                <!--<td>{{ formatToken(detailsTotal.token_buy) }}</td>
                <td>{{ formatPrice(detailsTotal.price_buy) }}</td>-->
                <td>{{ formatToken(selectedCurrencyTrades[0].token_buy) }}</td>
                <td>{{ formatPrice(selectedCurrencyTrades[0].price_buy) }}</td>
                <td></td>
                <td></td>
              </tr>
          </tfoot>
        </table>
      </div>
      <!--<div v-if="detailsTotal.token_sell !== 0">-->
      <div v-if="selectedCurrencyTrades[0].token_sell !== 0" class="details-container">
        <h2>{{ $t('sell panel') }}</h2>
        <table cellpadding="0" cellspacing="0" border="0" class="table-details">
          <thead>
            <tr>
              <th @click="sortByColumn('created_at')">
                  
                  <span v-if="sortColumn == 'created_at'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('date') }}</span>
              </th>
              <th @click="sortByColumn('platform')">
                  <span v-if="sortColumn == 'platform'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('platform') }}</span>
              </th>
              <th @click="sortByColumn('trade_type')">
                  <span v-if="sortColumn == 'trade_type'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('trade') }}</span>
              </th>
              <th @click="sortByColumn('token')">
                  <span v-if="sortColumn == 'token'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('token') }}</span>
              </th>
              <th @click="sortByColumn('price')">
                  <span v-if="sortColumn == 'price'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('received price') }} ($)</span>
              </th>
              <th @click="sortByColumn('token_price')">
                  <span v-if="sortColumn == 'token_price'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('market price') }} ($)</span>
              </th>
              <th @click="sortByColumn('details')">
                  <span v-if="sortColumn == 'details'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('details') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="dt in sortTradesDetails" :key="dt.created_at" v-show="dt.side === 'sell' ">
                  <td>{{ formatDate(dt.created_at) }}</td>
                  <td>{{ dt.platform }}</td>
                  <td>{{ dt.trade_type }}</td>
                  <!--<td>{{ formatToken(dt.token_sell) }}</td>
                  <td>{{ formatPrice(dt.received_price) }} {{ dt.stablecoin }}</td>-->
                  <td>{{ formatToken(dt.token) }}</td>
                  <td>{{ formatPrice(dt.price) }} {{ dt.stablecoin }}</td>
                  <td>{{ formatPrice(dt.token_price) }}</td>
                  <td>{{ dt.trade_details }}</td>
              </tr>
          </tbody>
          <tfoot>
              <tr>
                <td>{{ $t('total') }}:</td>
                <td></td>
                <td></td>
                <!--<td>{{ formatToken(detailsTotal.token_sell) }}</td>
                <td>{{ formatPrice(detailsTotal.price_sell) }}</td>-->
                <td>{{ formatToken(selectedCurrencyTrades[0].token_sell) }}</td>
                <td>{{ formatPrice(selectedCurrencyTrades[0].price_sell) }}</td>
                <td></td>
                <td></td>
              </tr>
          </tfoot>
        </table>
      </div>
      <!--<div v-if="detailsTotal.token_other !== 0">-->
      <div v-if="selectedCurrencyTrades[0].token_other !== 0" class="details-container">
        <h2>{{ $t('other transaction') }}</h2>
        <table cellpadding="0" cellspacing="0" border="0" class="table-details">
          <thead>
            <tr>
              <th @click="sortByColumn('created_at')">
                  <span v-if="sortColumn == 'created_at'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('date') }}</span>
              </th>
              <th @click="sortByColumn('platform')">
                  <span v-if="sortColumn == 'platform'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('platform') }}</span>
              </th>
              <th @click="sortByColumn('trade_type')">
                  <span v-if="sortColumn == 'trade_type'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('trade') }}</span>
              </th>
              <th @click="sortByColumn('token')">
                  <span v-if="sortColumn == 'token'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('token') }}</span>
              </th>
              <th @click="sortByColumn('price')">
                  <span v-if="sortColumn == 'price'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('price') }} ($)</span>
              </th>
              <th @click="sortByColumn('token_price')">
                  <span v-if="sortColumn == 'token_price'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('market price') }} ($)</span>
              </th>
              <th @click="sortByColumn('details')">
                  <span v-if="sortColumn == 'details'"><div class="arrow-down"></div></span>
                  <span v-else><div class="arrow-up"></div></span>
                  <span>{{ $t('details') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="dt in sortTradesDetails" :key="dt.created_at" v-show="dt.side === 'other transaction' ">
                  <td>{{ formatDate(dt.created_at) }}</td>
                  <td>{{ dt.platform }}</td>
                  <td>{{ dt.trade_type }}</td>
                  <!--<td>{{ formatToken(dt.token_other) }}</td>
                  <td>{{ formatPrice(dt.price_other) }} {{ dt.stablecoin }}</td>-->
                  <td>{{ formatToken(dt.token) }}</td>
                  <td>{{ formatPrice(dt.price) }} {{ dt.stablecoin }}</td>
                  <td>{{ formatPrice(dt.token_price) }}</td>
                  <td>{{ dt.trade_details }}</td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!--<div>
      <h3>Increment Counter</h3>
      <button @click="actionInc()">Press Me</button>
      <h5>Counter: {{state.counter}}</h5>
      <h3>Double Counter:</h3>
      {{doubleCounter}}
    </div>
    <div>
      <h3>Sub Counter</h3>
      <button @click="actionDec()">Press Me</button>
      <h5>Counter: {{state.counter}}</h5>
      <h3>Half Counter:</h3>
      {{halfCounter}}
    </div>-->
  </div>
</template>

<!-- https://class-component.vuejs.org/guide/props-definition.html  -->
<script lang="ts">
// import { Options, Vue } from 'vue-class-component'
import { defineComponent, Ref, ref, computed, watch } from 'vue';
import { useStore } from '../store';
import moment from 'moment'
// import { MutationTypes } from '../store/mutations';
// import { ActionTypes } from '../store/actions';

export default defineComponent({
  name: 'TradeTable',
  setup() {
    // Local variable
    const selectedCurrency : Ref<string> = ref('');
    interface CurrencyTrade {
      currency: string,
      trade_list: any,
      token_buy: number,
      token_sell: number,
      token_other: number,
      token_balance: number,
      price_buy: number,
      price_sell: number,
      price_other: number,
      price_balance: number,
      price_token_average: number,
      price_buy_average: number,
      price_sell_average: number,
      current_market_price: number
    }
    const selectedCurrencyTrades : Ref<Array<CurrencyTrade>> = ref([{
      currency: '',
      trade_list: [],
      token_buy: 0,
      token_sell: 0,
      token_other: 0,
      token_balance: 0,
      price_buy: 0,
      price_sell: 0,
      price_other: 0,
      price_balance: 0,
      price_token_average: 0,
      price_buy_average: 0,
      price_sell_average: 0,
      current_market_price: 0
    }]);
    // Sort variable
    interface CurrencyTradesDetails {
      created_at: string,
      side: string,
      platform: string,
      trade_type: string,
      token: number,
      stablecoin: string,
      price: number,
      token_price: number,
      details: string
    }
    const tradesDetails : Ref<Array<CurrencyTradesDetails>> = ref([{
      created_at: '',
      side: '',
      platform: '',
      trade_type: '',
      token: 0,
      stablecoin: '',
      price: 0,
      token_price: 0,
      details: ''
    }]);
    const sortTradesDetails = ref(tradesDetails);
    const sortColumn = ref('platform');
    const sortDirection = ref(1);
    const arrowIconName = ref('arrow_drop_up');
    // Store variable
    const store = useStore();
    const state = ref(store.state);

    const formatDate = (value: string) => {
      if (value) {
        return moment(String(value)).format('DD/MM/YYYY');
      }
    };
    const formatToken = (value: number) => {
      if (value) {
        return value.toFixed(8);
      }
    };
    const formatPrice = (value: number) => {
      if (value) {
        return value.toFixed(3);
      }
    };
    watch(selectedCurrency, (curr) => {
        selectedCurrencyTrades.value = state.value.trade.filter(item => item.currency === curr);
        for (let i = 0; i < state.value.trade.length; i++) {
          if (state.value.trade[i].currency === curr) {
            tradesDetails.value = state.value.trade[i].trade_list;
          }
        }
    }); 
    // sorting function
    const sortByColumn = (columnName: keyof CurrencyTradesDetails) => {
        sortColumn.value = columnName;
        sortDirection.value = -1 * sortDirection.value;
        if (sortDirection.value == 1) {
            arrowIconName.value = 'arrow_drop_up';
            sortTradesDetails.value.sort((a, b) => (a[columnName] > b[columnName] ? 1 : -1));
        } else {
            arrowIconName.value = 'arrow_drop_down';
            sortTradesDetails.value.sort((a, b) => (a[columnName] < b[columnName] ? 1 : -1));
        }
    }

    /* const inc = () => {
      store.commit(MutationTypes.INC_COUNTER, 1);
    };
    const dec = () => {
      store.commit(MutationTypes.DEC_COUNTER, 1);
    };
    const actionInc = () => {
      store.dispatch(ActionTypes.INC_COUNTER, 2);
    };
    const actionDec = () => {
      store.dispatch(ActionTypes.DEC_COUNTER, 2);
    };
    const doubleCounter = computed(() => store.getters.doubleCounter);
    const halfCounter = computed(() => store.getters.halfCounter); */
    return {
      selectedCurrency,
      selectedCurrencyTrades,
      tradesDetails,
      state,
      formatDate,
      formatToken,
      formatPrice,
      /* inc,
      dec,
      actionInc,
      actionDec,
      doubleCounter,
      halfCounter */
      sortTradesDetails,
      sortColumn,
      sortDirection,
      arrowIconName,
      sortByColumn
    };
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*th, td {
  padding: 0px 15px 0px 15px;
}*/
th, td {
  padding: 0px 5px 0px 5px;
}
td {
  border-bottom: solid 1px rgba(255,255,255,0.6);
}
td:first-child {
  border-left: solid 1px rgba(255,255,255,0.6);
}
td:last-child {
  border-right: solid 1px rgba(255,255,255,0.6);
}
thead {
  background-color: rgba(255,255,255,0.3);
  border: solid 1px rgba(255,255,255,0.6);
}
tfoot {
  font-weight: bold;
  background-color: rgba(255,255,255,0.3);
}
th > span:last-child {
  padding-left: 15px;
}
select {
  margin-top: 10px;
  margin-bottom: 10px;
}
.trade-details-container {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  background: linear-gradient(to right, #27b579, #27abb7);
  border: 1px solid #ffffff9c;
  padding-bottom: 20px;
}
.details-container {
  width: 97%;
}
.table-details {
  width: 100%;
}
h2 {
  margin: 10px 0 0;
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
.arrow-down {
  position: relative;
  left: 0px;
  bottom: -10px;
  height:0px;
  width:0px;
  border:none;
  border-top:5px solid #ffffff;
  border-left:5px solid rgba(0,0,0,0);
  border-right:5px solid rgba(0,0,0,0);
}
.arrow-up {
  position: relative;
  left: 0px;
  bottom: -10px;
  height:0px;
  width:0px;
  border:none;
  border-bottom:5px solid #ffffff;
  border-left:5px solid rgba(0,0,0,0);
  border-right:5px solid rgba(0,0,0,0);
}

@media screen and (min-width:750px){
    th, td {
      padding: 0px 15px 0px 15px;
    }
}

@media screen and (max-width:750px){
    table.table-details td:nth-child(7), table.table-details th:nth-child(7){
      display: none;
    }
}

@media screen and (max-width:580px){
    table.table-details td:nth-child(3), table.table-details th:nth-child(3){
      display: none;
    }
}

@media screen and (max-width:520px){
    table.table-details td:nth-child(2), table.table-details th:nth-child(2),
    #main-table td:nth-child(4), #main-table th:nth-child(4),
    #main-table td:nth-child(5), #main-table th:nth-child(5){
      display: none;
    }
}

@media screen and (max-width:410px){
    #main-table td:nth-child(7), #main-table th:nth-child(7){
      display: none;
    }
}

@media screen and (max-width:390px){
    table.table-details td:nth-child(6), table.table-details th:nth-child(6){
      display: none;
    }
}

@media screen and (max-width:360px){
    #main-table td:nth-child(8), #main-table th:nth-child(8){
      display: none;
    }
}

</style>
