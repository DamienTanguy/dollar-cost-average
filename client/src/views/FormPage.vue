<template>
  <div class="form">
	<Form platform="Coinbase" ref="coinbase" />
	<Form platform="Coinbase Pro" ref="coinbase_pro"/>
	<button id="button" @click="sendTradeRequest()">{{ $t('send') }}</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import axios from 'axios'
import Form from '@/components/Form.vue' // @ is an alias to /src
import { useStore } from '../store';
import { MutationTypes } from '../store/mutations';
import { ActionTypes } from '../store/actions';

@Options({
  components: {
    Form
  }
})

export default class FormPage extends Vue {
	$refs!: {
    	coinbase: HTMLFormElement,
    	coinbase_pro: HTMLFormElement
  	}
	sendTradeRequest() {
		// https://vuejs.org/guide/essentials/template-refs.html#template-refs
		var button = <HTMLInputElement> document.getElementById("button");
		button.disabled = true;
		if(this.$i18n.locale === 'en'){
			button.innerText  = "Wait for the result...";
		}else{
			button.innerText  = "Attendez le résultat...";
		}

		const object = {
			coinbase:{
				key: this.$refs.coinbase.key,
				secret: this.$refs.coinbase.secret
			},
			coinbase_pro:{
				key: this.$refs.coinbase_pro.key,
				secret: this.$refs.coinbase_pro.secret,
				passphrase: this.$refs.coinbase_pro.passphrase
			}	
		};

		axios.post('/get_trade', object).then(response => { //this.$refs
	      /*if(response.data[response.data.length-1].message){
	      	console.log('There is/are  '+ response.data[response.data.length-1].message + ' errors, please try it again');
	      	response.data.pop();
	      }*/
	      button.disabled = false;
	      if(this.$i18n.locale === 'en'){
			button.innerText  = "Send";
		  }else{
			button.innerText  = "Envoyez";
		  }
	      const store = useStore();
	      store.commit(MutationTypes.SET_TRADE, response.data);
	      store.dispatch(ActionTypes.SET_CURRENCY_LIST, response.data);
	      this.$router.push('/trade');
	    })
	}
}
</script>