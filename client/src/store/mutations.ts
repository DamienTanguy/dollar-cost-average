import { MutationTree } from 'vuex';
import { State } from './state'

export enum MutationTypes {
  SET_TRADE = 'SET_TRADE',
  SET_CURRENCY_LIST = 'SET_CURRENCY_LIST'
}

export type Mutations<S = State> = {
  [MutationTypes.SET_TRADE](state: S, payload: any): void;
  [MutationTypes.SET_CURRENCY_LIST](state: S, payload: any): void;
};

// define mutations
export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.SET_TRADE](state: State, payload: any) {
    state.trade = payload;
  },
  [MutationTypes.SET_CURRENCY_LIST](state: State, payload: any) {
    state.currencyList = payload;
  }
};