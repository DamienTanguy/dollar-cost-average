import { Ref, ref } from 'vue';
import { ActionContext, ActionTree } from 'vuex';
import { State } from './state'
import { MutationTypes, Mutations } from './mutations'

export enum ActionTypes {
  SET_CURRENCY_LIST = 'SET_CURRENCY_LIST'
}

export type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

// actions interface

export interface Actions {
  [ActionTypes.SET_CURRENCY_LIST](
    { commit }: AugmentedActionContext,
    payload: any
  ): void;
}

export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.SET_CURRENCY_LIST]({ commit }, payload: any) {
    const currencyList : Array<string> = [''];
    payload.forEach((trade: any) => {
      currencyList.push(trade.currency);
    });
    commit(MutationTypes.SET_CURRENCY_LIST, currencyList);
  }
};