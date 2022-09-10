/* eslint-disable */
//Allows .vue single file components to be imported and used.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
