// https://carrotfarmer.github.io/posts/vuex-with-class-components/?utm_campaign=vuex-with-class-componentslearn-how-to
// https://vuex.vuejs.org/guide/typescript-support.html#typing-store-property-in-vue-component
// https://github.com/ErikCH/Vue3TypeScript/tree/vuex/src

import {
  createStore,
  Store as VuexStore,
  CommitOptions,
  DispatchOptions
} from 'vuex';

import { State, state } from './state'
import { Getters, getters } from './getters'
import { MutationTypes, Mutations, mutations } from './mutations'
import { ActionTypes, AugmentedActionContext, Actions, actions } from './actions'

// setup store type
export type Store = Omit<
  VuexStore<State>,
  'commit' | 'getters' | 'dispatch'
> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
};

export const store = createStore({
  state,
  mutations,
  actions,
  getters
});

export function useStore() {
  return store as Store;
}

// Use of module --> https://www.codeproject.com/Tips/5295301/Correctly-Typing-Vuex-with-TypeScript
// Type definiion --> https://www.typescriptlang.org/docs/handbook/utility-types.html 