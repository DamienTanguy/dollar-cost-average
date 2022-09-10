///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// IMPROVEMENT IDEAS ////////////////////////////////////////////////////////////////////////////////
//////////////// 1- Add more fiat currency ////////////////////////////////////////////////////////////////////////
//////////////// 2- Increase the limit of account/transaction - current limit 100 /////////////////////////////////
//////////////// Check on: https://stackoverflow.com/questions/67343099/coinbase-api-btc-account-missing //////////
//////////////// 3- Create a function to convert euro/dollars /////////////////////////////////////////////////////
//////////////// 4- Download data in CSV/excel files  /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const axios = require('axios').default;
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const request = require('request');
const coinbase = require('coinbase');
const coinbasepro = require('coinbase-pro');
const fs = require('fs');
//const PORT = 3000;
const env = require('dotenv');

//Initial config
env.config();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Heroku deployement
//if(process.env.NODE_ENV === 'production') {
	console.log(`Heroku deployement`);
	//Static folder
	app.use(express.static(__dirname + '/build-front/'));
	//Handle SPA
	app.get(/.*/, (req, res) => res.sendFile(__dirname + '/build-front/index.html'));
/*}else {
	console.log(`Local development`);
	var path = require('path');
	app.get('/', (req, res) => {
	  res.sendFile(path.join(__dirname, '../client/public', 'index.html'));
	});
}*/


const stablecoinArray = ['EUR','USD','USDT','USDC','DAI']; //Array to store the stablecoin

app.post('/get_trade', function (req, res) {

	var errorTab = []; //Array to store the error
	var tradeList = []; //Array to store all the trade from API 
	var mergeTradeByCurrency = []; //Array to store the trade merged by currency
	var tradeStats = []; //Array to store the trade merged by currency with statistics
	var tradeWithMarketPrice = []; //Array to store the trade merged by currency with statistics and market price
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////// CONVERSION EUROS-DOLLARS MANAGEMENT //////////////////////////////////////////////////////////////
	//////////////// 1- Get all the period since 2012 until today /////////////////////////////////////////////////////
	//////////////// 2- Make the request to api.frankfurter.app to get all exchange rate for the period////////////////
	//////////////// 3- If the fiat is EURO, convert the value to dollar with the closest day//////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var periodList = [];
	var today = new Date();
	var currentYear = today.getFullYear();
	var currentMonth = today.getMonth()+1;
	currentMonth = currentMonth < 10 ? '0'+currentMonth : currentMonth;
	var currentDay = today.getDate();
	currentDay = currentDay < 10 ? '0'+currentDay : currentDay;
	while(currentYear > 2012){ //Coinbase started in 2012, 'year' to adjust if you have transaction before that year with another platform
		var periodEnd = currentYear +'-'+ currentMonth +'-'+ currentDay;
		var periodStart = currentYear-1 +'-'+ currentMonth +'-'+ currentDay;
		periodList.push(periodStart + '..'+periodEnd);
		currentYear--;
	}

	var euroDollarRate = {};
	for(let i = 0; i < periodList.length; i++){
		const options = {
		  method: 'GET',
		  url: 'https://api.frankfurter.app/'+periodList[i]+'?amount=1&from=EUR&to=USD', //no data on weekend
		  headers: {Accept: 'application/json'}
		};
		axios.request(options).then(function (response) {
			euroDollarRate = Object.assign(euroDollarRate, response.data.rates);
		}).catch(function (error) {
		  console.error(error);
		  errorTab.push(error);
		})
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////// TIME MANAGEMENT //////////////////////////////////////////////////////////////////////////////////
	//////////////// 1- The timer is launched with the function startIdleTimer() //////////////////////////////////////
	//////////////// 2- After receiving the response of an API call, the timer is reset with the function resetTimer()/
	//////////////// 3- If the timer reaches 15 seconds, no more response from API call will be received //////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let currSeconds = 0;

	function resetTimer() {
		currSeconds = 0;
	}

	function startIdleTimer() {
		currSeconds++;
	}

	var myTimer = setInterval(() => {
		startIdleTimer();
		console.log('currSeconds: ' + currSeconds);
	    if(currSeconds === 15){
		    mergeTradeByCurrency = mergeByCurrencyTradeFct(tradeList);
		    tradeStats = statisticsCalculateFct(mergeTradeByCurrency, euroDollarRate);
		    tradeWithMarketPrice = getCurrentMarketPrice(tradeStats);    
		}
		if(currSeconds === 20){
			if(errorTab.length !== 0){
				tradeWithMarketPrice.push({message : tradeWithMarketPrice.length });
			}
		    clearInterval(myTimer);
		    res.send(tradeWithMarketPrice);
		}
	}, 1000);

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////// COINBASE REQUEST /////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if(req.body.coinbase.key !== '' && req.body.coinbase.secret !== ''){

		var client = new coinbase.Client({
			'apiKey': req.body.coinbase.key, 
			'apiSecret': req.body.coinbase.secret,
			strictSSL: false
		});

		client.getAccounts({ "limit": 100}, function(err, accounts) { //limit option --> 25 wallet by default, 100 wallet max 
			if(accounts !== null){
				accounts.forEach(function(acct) {
				    client.getAccount(String(acct.id), function(err, account) {
				        if(account !== null){
				        	//check if the currency is a stablecoin --> if stablecoin, do not get the trade
							let isStablecoin;
							isStablecoin = stablecoinArray.includes(account.currency);
							if(!isStablecoin){
							  account.getTransactions({ "limit": 100}, function(err, txs, pagination) { //limit option --> 25 transactions by default, 100 transactions max 
							  	//type: pro_deposit (to coinbase pro) / pro_withdrawal (to coinbase pro) / trade / send (bonus Coinbase) / buy
							    if(txs !== null){
							    	txs.forEach(function(tx) {
								    	if(tx.type === 'buy' || tx.type === 'sell' || tx.type === 'trade' || tx.type === 'send' /*|| tx.type === 'inflation_reward'*/){
								    		tx.currency = tx.amount.currency;
								    		tx.platform = 'coinbase';
								    		tradeList.push(tx);
								    	}
							    		resetTimer();
							    	});
							    }
							    if(err !== null){
									errorTab.push(err);
								}
							  });
							}
						}
						if(err !== null){
							errorTab.push(err);
						}
					});
				});
			}
			if(err !== null){
				errorTab.push(err);
			}
		});

	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////// COINBASE PRO REQUEST /////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	if(req.body.coinbase_pro.key !== '' && req.body.coinbase_pro.secret !== '' && req.body.coinbase_pro.passphrase !== ''){
		//https://github.com/coinbase/coinbase-pro-node
		//https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getaccounts 
		const coinbase_pro_apiURI = 'https://api.pro.coinbase.com';
		const authedClient = new coinbasepro.AuthenticatedClient(
		  req.body.coinbase_pro.key,
		  req.body.coinbase_pro.secret,
		  req.body.coinbase_pro.passphrase,
		  coinbase_pro_apiURI
		);

		var orderHistoryArray = []; //Array to store the order_id and compare if the trade has been already processed

		getWalletList();

		function getWalletList(){
			authedClient
			.getAccounts()
			.then(wallet_list_response => {
				getWalletHistoryRequestQueue(wallet_list_response);
			}).catch(error => {
				// handle the error
				console.log('Error getAccounts');
				console.log(error);
				errorTab.push(error);
			});
		}

		// responisble for maintaining queue (in the form of array) and setting interval
		// Create a new reference of list, pop the item, calls getWalletHistory
		// and once promise gets resolved, move the item back in the list (front of the array)
		function getWalletHistoryRequestQueue(walletList) {
		  
		  let interval;
		  const _wallet_list = [...walletList];

		  interval = setInterval(() => {
		    // pop wallet item from list for get wallet item history
		    const wallet = _wallet_list.pop();

		    getWalletHistory(wallet);

		    if(_wallet_list.length === 0){
		    	clearInterval(interval);
		    }

		  }, 150);
		}

		const getWalletHistory = async function(wallet){
			// return the wallet history promise
			return authedClient
					.getAccountHistory(wallet.id)
					.then((order_list) => {

					  order_list.forEach(function(order){
					  	order.wallet = wallet;
					  });
					  //console.log(order_list);
					  if(order_list.length !== 0){
						getOrderHistoryRequestQueue(order_list);
					}

					}).catch((error) => {
					  // handle the error
					  console.log("Error getAccountHistory");
					  console.log(error);
					  errorTab.push(error);
					});
		}

		function getOrderHistoryRequestQueue(orderlist) {
		  
		  let interval;
		  const _order_list = [...orderlist];
		  
		  interval = setInterval(() => {
		    // pop wallet item from list for get wallet item history
		    const order = _order_list.pop();

		    if(order){
			    if(order.type === 'match'){
					if(order.details.order_id !== undefined){

						//check if the currency is a stablecoin --> if stablecoin, do not get the trade
						let isStablecoin;
					  	isStablecoin = stablecoinArray.includes(order.wallet.currency);
					  	if(!isStablecoin){
					  		//store the order_id and check if there is already this order_id in the queue
					  		let isOrderAlreadyDone;
					  		isOrderAlreadyDone = orderHistoryArray.includes(order.details.order_id);
					  		orderHistoryArray.push(order.details.order_id);
					  		if(!isOrderAlreadyDone){
					  			getOrder(order);
					  		}
					  	}
					}
				}
			}

			if(_order_list.length === 0){
		    	clearInterval(interval);
		    }

		  }, 150);
		}

		const getOrder = async function(order){
			// return the wallet history promise
			return authedClient
					.getOrder(order.details.order_id)
					.then((trade) => {

						trade.order = order;
						trade.currency = order.wallet.currency;
						trade.stablecoin = order.details.product_id.substring(trade.currency.length+1);
						trade.platform = 'coinbase pro';

						if(trade.side === 'buy' || trade.side === 'sell'){
						    tradeList.push(trade);
						    //console.log('* NEW TRADE COINBASE PRO');
						}
						resetTimer();

					}).catch((error) => {
					  // handle the error
					  console.log("Error getOrder");
					  console.log(error);
					  errorTab.push(error);
					});
		}
	}


});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// FUNCTION TO MERGE THE TRADE BY CURRENCY ////////////////////////////////////////////////////////////////
//////////////// 1- Get all of the trade received from API //////////////////////////////////////////////////////////////
//////////////// 2- For each trade, check if the currency is in the referential list ////////////////////////////////////
//////////////// 3- If the currency is already exist, push the trade for the desired currency ///////////////////////////
//////////////// 4- If not, create the new currency in the referential list and push the trade in a new row /////////////
//////////////// 5- Return an array of object, 1 object include currency name and an array of trade named 'trade_list' //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function mergeByCurrencyTradeFct(tradeList) {
  const _trade_list = [...tradeList];
  let mergeTradeByCurrency = [];
  let currency_list = {};
  //order the trade belonging to the same pair in the same object
  for (var i = 0 ; i < _trade_list.length ; i++) {
      trade = _trade_list[i];
      if (!(trade['currency'] in currency_list)) {
          currency_list[trade['currency']] = { currency: trade['currency'].currency, trade_list: [] };
          mergeTradeByCurrency.push(currency_list[trade['currency']]);
      }
      currency_list[trade['currency']].trade_list.push(trade);
  }
  return mergeTradeByCurrency;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// FUNCTION TO CALCULATE STATISTICS AND ALL ATRIBUTES TO DISPLAY TO THE USER //////////////////////////////
//////////////// 1- Get all of the trade ordered by currency ////////////////////////////////////////////////////////////
//////////////// 2- For each currency, calculate all the global statistics for each currency ////////////////////////////
//////////////// 3- For each trade, add all the attribute used to display to the user ///////////////////////////////////
//////////////// 4- Return an array of object, same as input with all the attribute added ///////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function statisticsCalculateFct(tradeList, euroDollarRate) {
	
		const _trade_list = [...tradeList];

		_trade_list.forEach(function(trade){
			let token_buy = 0;
			let token_sell = 0;
			let token_other = 0;
			let price_buy = 0;
			let price_sell = 0;
			let price_other = 0;
			let token_balance = 0;
			let price_balance = 0;
			let price_buy_average = 0;
			let price_sell_average = 0;
	    	for (let i = 0; i < trade.trade_list.length; i++) {

	    		if(trade.trade_list[i].platform === 'coinbase'){
	    			if(trade.trade_list[i].type === 'buy'){
	    				trade.trade_list[i].side = 'buy';
	    				trade.trade_list[i].stablecoin = trade.trade_list[i].native_amount.currency;
	    				trade.trade_list[i].trade_type = trade.trade_list[i].details.title;
	    				trade.trade_list[i].trade_details = trade.trade_list[i].details.header + ' ' +  trade.trade_list[i].details.subtitle;
			    		trade.trade_list[i].price = parseFloat(trade.trade_list[i].native_amount.amount);
			    		trade.trade_list[i].token = parseFloat(trade.trade_list[i].amount.amount);
			    		trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
			    		token_buy += parseFloat(trade.trade_list[i].amount.amount);
					    price_buy += parseFloat(trade.trade_list[i].native_amount.amount);
			    	}
			    	if(trade.trade_list[i].type === 'sell'){
			    		trade.trade_list[i].side = 'sell';
			    		trade.trade_list[i].stablecoin = trade.trade_list[i].native_amount.currency;
			    		trade.trade_list[i].trade_type = trade.trade_list[i].details.title;
			    		trade.trade_list[i].trade_details = trade.trade_list[i].details.header + ' ' +  trade.trade_list[i].details.subtitle;
			    		trade.trade_list[i].price = parseFloat(trade.trade_list[i].native_amount.amount);
			    		trade.trade_list[i].token = parseFloat(trade.trade_list[i].amount.amount);
			    		trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
			    		token_sell += parseFloat(trade.trade_list[i].amount.amount);
					    price_sell += parseFloat(trade.trade_list[i].native_amount.amount);
			    	}
			    	if(trade.trade_list[i].type === 'trade'){
						trade.trade_list[i].trade_type = trade.trade_list[i].type;
						trade.trade_list[i].trade_details = trade.trade_list[i].details.header + ' ' +  trade.trade_list[i].details.subtitle;
						trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
						if(trade.trade_list[i].amount.amount < 0){ //Sell case
							trade.trade_list[i].side = 'sell';
							trade.trade_list[i].price = Math.abs(parseFloat(trade.trade_list[i].native_amount.amount));
							trade.trade_list[i].token = Math.abs(parseFloat(trade.trade_list[i].amount.amount));
				    		trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
				    		token_sell += Math.abs(parseFloat(trade.trade_list[i].amount.amount));
						    price_sell += Math.abs(parseFloat(trade.trade_list[i].native_amount.amount));
						}else{ //Buy case
							trade.trade_list[i].side = 'buy';
							trade.trade_list[i].price = parseFloat(trade.trade_list[i].native_amount.amount);
							trade.trade_list[i].token = parseFloat(trade.trade_list[i].amount.amount);
				    		trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
				    		token_buy += parseFloat(trade.trade_list[i].amount.amount);
						    price_buy += parseFloat(trade.trade_list[i].native_amount.amount);
						}
			    	}
			    	if(trade.trade_list[i].type === 'send'){
			    		let regexp1 = "Earn";
			    		let regexp2 = "Referral";
			    		if(trade.trade_list[i].details.subtitle.match(regexp1) || trade.trade_list[i].details.subtitle.match(regexp2)){ //Reward from referral or coinbase earn
			    			trade.trade_list[i].side = 'buy';
				    		trade.trade_list[i].trade_type = trade.trade_list[i].details.title;
				    		trade.trade_list[i].trade_details = trade.trade_list[i].details.header + ' ' +  trade.trade_list[i].details.subtitle;
				    		trade.trade_list[i].price = parseFloat(trade.trade_list[i].native_amount.amount);
				    		trade.trade_list[i].token = parseFloat(trade.trade_list[i].amount.amount);
				    		trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
				    		token_buy += parseFloat(trade.trade_list[i].amount.amount);
						    price_buy += parseFloat(trade.trade_list[i].native_amount.amount);
			    		}else{ //send or received to token address
			    			trade.trade_list[i].side = 'other transaction';
				    		trade.trade_list[i].trade_type = trade.trade_list[i].details.title;
				    		trade.trade_list[i].trade_details = trade.trade_list[i].details.header + ' ' +  trade.trade_list[i].details.subtitle;
				    		trade.trade_list[i].price = parseFloat(trade.trade_list[i].native_amount.amount);
				    		trade.trade_list[i].token = parseFloat(trade.trade_list[i].amount.amount);
				    		trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
				    		token_other += parseFloat(trade.trade_list[i].amount.amount);
						    price_other += parseFloat(trade.trade_list[i].native_amount.amount);
			    		}
			    	}
			    	/*if(trade.trade_list[i].type === 'inflation_reward'){
			    			trade.trade_list[i].side = 'other transaction';
				    		trade.trade_list[i].trade_type = trade.trade_list[i].details.title;
				    		trade.trade_list[i].trade_details = trade.trade_list[i].details.header + ' ' +  trade.trade_list[i].details.subtitle;
				    		trade.trade_list[i].price_other = parseFloat(trade.trade_list[i].native_amount.amount);
				    		trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].native_amount.amount) / parseFloat(trade.trade_list[i].amount.amount);
				    		trade.trade_list[i].token_other = parseFloat(trade.trade_list[i].amount.amount);
				    		token_other += trade.trade_list[i].token_other;
						    price_other += parseFloat(trade.trade_list[i].native_amount.amount);
			    	}*/

	    		}else if(trade.trade_list[i].platform === 'coinbase pro'){
	    			if(trade.trade_list[i].side === 'buy'){
						trade.trade_list[i].trade_type = trade.trade_list[i].product_id;
						trade.trade_list[i].trade_details = trade.trade_list[i].type + ' ' + trade.trade_list[i].product_id;

					    //conversion EUR --> USD/USDT/USDC/DAI
						if(trade.trade_list[i].stablecoin === 'EUR'){
							
							var tradeDate = new Date(trade.trade_list[i].done_at);
							var tradeYear = tradeDate.getFullYear();
							var tradeMonth = tradeDate.getMonth()+1;
							tradeMonth = tradeMonth < 10 ? '0'+tradeMonth : tradeMonth;
							var tradeDay = tradeDate.getDate();
							tradeDay = tradeDay < 10 ? '0'+tradeDay : tradeDay;
							var formatTradeDate = tradeYear +'-'+ tradeMonth +'-'+ tradeDay;
							while(euroDollarRate[formatTradeDate] === undefined){
								tradeDate.setDate(tradeDate.getDate()-1);
								tradeMonth = tradeDate.getMonth()+1;
								tradeMonth = tradeMonth < 10 ? '0'+tradeMonth : tradeMonth;
								tradeDay = tradeDate.getDate();
								tradeDay = tradeDay < 10 ? '0'+tradeDay : tradeDay;
								formatTradeDate = tradeYear +'-'+ tradeMonth +'-'+ tradeDay;	
							}
							var convertRate = euroDollarRate[formatTradeDate].USD;
							
							trade.trade_list[i].price = (parseFloat(trade.trade_list[i].executed_value) + parseFloat(trade.trade_list[i].fill_fees)) * convertRate;
							trade.trade_list[i].token = parseFloat(trade.trade_list[i].filled_size);
							trade.trade_list[i].token_price = (parseFloat(trade.trade_list[i].price) / parseFloat(trade.trade_list[i].filled_size)); 
							trade.trade_list[i].stablecoin = '$ ( '+ (parseFloat(trade.trade_list[i].executed_value) + parseFloat(trade.trade_list[i].fill_fees)).toFixed(3) +'€, date: ' + tradeDay + '/'+ tradeMonth + '/'+ tradeYear +' )';
						
						}else{
						    trade.trade_list[i].price = parseFloat(trade.trade_list[i].executed_value) + parseFloat(trade.trade_list[i].fill_fees);
						    trade.trade_list[i].token = parseFloat(trade.trade_list[i].filled_size);
						    trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].price) / parseFloat(trade.trade_list[i].filled_size); 
						}
						token_buy += parseFloat(trade.trade_list[i].filled_size);
						price_buy += parseFloat(trade.trade_list[i].price);

					}else if(trade.trade_list[i].side === 'sell'){
					    trade.trade_list[i].trade_type = trade.trade_list[i].product_id;
					    trade.trade_list[i].trade_details = trade.trade_list[i].type + ' ' + trade.trade_list[i].product_id;

					    //conversion EUR --> USD/USDT/USDC/DAI
						if(trade.trade_list[i].stablecoin === 'EUR'){
							
							var tradeDate = new Date(trade.trade_list[i].done_at);
							var tradeYear = tradeDate.getFullYear();
							var tradeMonth = tradeDate.getMonth()+1;
							tradeMonth = tradeMonth < 10 ? '0'+tradeMonth : tradeMonth;
							var tradeDay = tradeDate.getDate();
							tradeDay = tradeDay < 10 ? '0'+tradeDay : tradeDay;
							var formatTradeDate = tradeYear +'-'+ tradeMonth +'-'+ tradeDay;
							while(euroDollarRate[formatTradeDate] === undefined){
								tradeDate.setDate(tradeDate.getDate()-1);
								tradeMonth = tradeDate.getMonth()+1;
								tradeMonth = tradeMonth < 10 ? '0'+tradeMonth : tradeMonth;
								tradeDay = tradeDate.getDate();
								tradeDay = tradeDay < 10 ? '0'+tradeDay : tradeDay;
								formatTradeDate = tradeYear +'-'+ tradeMonth +'-'+ tradeDay;	
							}
							var convertRate = euroDollarRate[formatTradeDate].USD;

						    trade.trade_list[i].price = (parseFloat(trade.trade_list[i].executed_value) - parseFloat(trade.trade_list[i].fill_fees)) * convertRate;
						    trade.trade_list[i].token = parseFloat(trade.trade_list[i].size);
						    trade.trade_list[i].token_price = (parseFloat(trade.trade_list[i].price) / parseFloat(trade.trade_list[i].size)); 
						    trade.trade_list[i].stablecoin = '$ ( '+ (parseFloat(trade.trade_list[i].executed_value) - parseFloat(trade.trade_list[i].fill_fees)).toFixed(3) +'€, date: ' + tradeDay + '/'+ tradeMonth + '/'+ tradeYear +' )';

						}else{
						    trade.trade_list[i].price = parseFloat(trade.trade_list[i].executed_value) - parseFloat(trade.trade_list[i].fill_fees); 
						    trade.trade_list[i].token = parseFloat(trade.trade_list[i].size);
						    trade.trade_list[i].token_price = parseFloat(trade.trade_list[i].price) / parseFloat(trade.trade_list[i].size);
						}
						token_sell += parseFloat(trade.trade_list[i].size);
						price_sell += parseFloat(trade.trade_list[i].price);
					}
	    		}

		    }
		    trade.currency = trade.trade_list[0].currency;
		    trade.token_buy = token_buy;
			trade.token_sell = token_sell;
			trade.token_other = token_other;
			trade.price_buy = price_buy;
			trade.price_sell = price_sell;
			trade.price_other = price_other;
			trade.token_balance = token_buy - token_sell;
			trade.price_balance = price_buy - price_sell;
			if(trade.token_balance !== 0){
				trade.price_token_average = trade.price_balance / trade.token_balance;
			}else{
				trade.price_token_average = 0;
			}
			trade.price_buy_average = price_buy / token_buy;
			if(token_sell !== 0){
				trade.price_sell_average = price_sell / token_sell;
			}else{
				trade.price_sell_average = 0
			}
		});	

  return _trade_list;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// FUNCTION TO GET THE CURRENT MARKET PRICE OF EACH CURRENCY //////////////////////////////////////////////
//////////////// 1- Get all of the trade ordered by currency with all the statistics ////////////////////////////////////
//////////////// 2- For each currency, make an API call to get the market price for each currency ///////////////////////
//////////////// 3- Return an array of object, same as input with the price market added ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getCurrentMarketPrice(tradeList) {
  const _trade_list = [...tradeList];
  _trade_list.forEach((trade) =>{
		const requestMarketPriceOptions = {
		  method: 'GET',
		  url: 'https://api.coinbase.com/v2/prices/'+trade.currency+'-USD/spot',
		  headers: {Accept: 'application/json'}
		};
		axios.request(requestMarketPriceOptions).then(function (response) {
			trade.current_market_price = response.data.data.amount;
		}).catch(function (error) {
		  console.error(error);
		  errorTab.push(error);
		})
  });
  return _trade_list;
}


app.listen(process.env.PORT, function() {
  console.log(`server is working on port ${process.env.PORT}`);
});

module.exports = app;