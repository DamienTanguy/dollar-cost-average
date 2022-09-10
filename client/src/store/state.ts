// declare state
export type State = { 
	currencyList: Array<string>,
	trade: Array<{
		currency: string,
		trade_list: Array<{
			side: string,
			created_at: string,
			platform: string,
			trade_type: string, 
			token: number,
			stablecoin: string,
			price: number,
			token_price: number,
			details: string
		}>,
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
	}> 
};

// set state
export const state: State = { 
	currencyList : ['ALGO', 'DOT'],
	trade: [
		{ 
			currency: 'ALGO',
			trade_list: [
				{
					side: 'buy',
					created_at: '01/10/2022',
					platform: 'coinbase pro',
					trade_type: 'buy', 
					token: 16,
					price: 33.38,
					stablecoin: 'USDT',
					token_price: 2.08,
					details: 'details'
				}
			],
			token_buy: 16,
			token_sell: 0,
			token_other: 0,
			token_balance: 16,
			price_buy: 33.38,
			price_sell: 0,
			price_other: 0,
			price_balance: 33.38,
			price_token_average: 2.08,
			price_buy_average: 2.08,
			price_sell_average: 0,
			current_market_price: 1.25
		},
		{ 
			currency: 'DOT',
			trade_list: [
				{
					side: 'buy',
					created_at: '01/10/2022',
					platform: 'coinbase pro',
					trade_type: 'buy', 
					token: 10,
					price: 15.5,
					stablecoin: 'DAI',
					token_price: 1.55,
					details: 'details'
				}, {
					side: 'buy',
					created_at: '01/10/2022',
					platform: 'coinbase',
					trade_type: 'buy', 
					token: 15,
					price: 20.7,
					stablecoin: 'USDT',
					token_price: 1.38,
					details: 'details'
				}, {
					side: 'sell',
					created_at: '01/10/2022',
					platform: 'coinbase pro',
					trade_type: 'sell',
					token: 15,
					price: 18.9, 
					stablecoin: 'USDC',
					token_price: 1.26,
					details: 'details'
				}
			],
			token_buy: 25,
			token_sell: 15,
			token_other: 0,
			token_balance: 10,
			price_buy: 36.2,
			price_sell: 18.9,
			price_other: 0,
			price_balance: 17.3,
			price_token_average: 1.73,
			price_buy_average: 1.465,
			price_sell_average: 1.26,
			current_market_price: 1.5
		}
	] 
};