# study-vue

## vue-router

> Vue Router 是 Vue.js 官⽅的路由管理器。它和 Vue.js 的核⼼深度集成，让构建单⻚⾯应⽤变得易如反
> 掌。

- 实现迷你 vue-router 代码 [my-router](./src/myrouter/myvue-router.js)

## Vuex

> Vuex 集中式存储管理应⽤的所有组件的状态，并以相应的规则保证状态以可预测的⽅式发⽣变化。

- 实现迷你 vuex 代码 [my-vuex](./src/mystore/myvuex.js)

## Vue

> Vue的设计思想:MVVM模式。MVVM框架的三要素：数据响应式、模板引擎及其渲染。

1、数据响应式：监听数据变化并在视图中更新

    Object.defineProperty()
    Proxy
  
2、模版引擎：提供描述视图的模版语法

    插值：{{}}
    指令：v-bind，v-on，v-model，v-for，v-if

3、渲染：如何将模板转换为html
  
    模板 => vdom => dom

- 实现迷你 vue 代码 [my-vue](./myvue/myvue.js)
