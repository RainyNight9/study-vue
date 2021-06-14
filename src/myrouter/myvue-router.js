// spa ⻚⾯不能刷新
// hash #/about
// History api /about

// url变化显示对应内容：
// 1.router-view：占位容器
// 2.数据响应式：current变量持有url地址，⼀旦变化，动态重新执⾏render

import View from "./my-router-view";

let Vue; // 引⽤构造函数，VueRouter中要使⽤

// 1.实现插件
// 实现VueRouter类
// 处理路由选项
// 监控url变化，hashchange
// 响应这个变化
class VueRouter {
  constructor(options) {
    this.$options = options; // 保存选项

    // 数据响应式，current必须是响应式的，这样他变化，使用它的组件就会重新render
    // 如何造一个响应式数据
    // 方式1：借鸡生蛋 - new Vue({data: {current: '/'}})
    // 方式2：Vue.util.defineReactive(obj, 'current', '/')
    // Vue.set(this)
    // Vue.set(obj, 'key', 'val')
    // 定义响应式的属性current
    // Vue.util.defineReactive(
    //   this,
    //   "current",
    //   window.location.hash.slice(1) || "/"
    // );

    this.current = window.location.hash.slice(1) || "/";
    Vue.util.defineReactive(this, "matched", []);
    // match 方法可以递归遍历路由表，获得匹配关系数组
    this.match();

    // 监控url变化 监听hashchange事件
    window.addEventListener("hashchange", this.onHashChange.bind(this));
    window.addEventListener("load", this.onHashChange.bind(this));

    // 提前处理路由表
    // 提前处理路由表避免每次都循环
    // 缓存path和route映射关系
    // this.routeMap = {};
    // this.$options.routes.forEach((route) => {
    //   this.routeMap[route.path] = route;
    // });
  }
  onHashChange() {
    this.current = window.location.hash.slice(1);
    //
    this.matched = [];
    this.match();
  }

  match(routes) {
    routes = routes || this.$options.routes;

    // 递归遍历
    for (const route of routes) {
      if (route.path === "/" && this.current === "/") {
        this.matched.push(route);
        return;
      }

      // /about/info
      if (route.path !== "/" && this.current.indexOf(route.path) != -1) {
        this.matched.push(route);
        if (route.children) {
          this.match(route.children);
        }
        return;
      }
    }
  }
}

// 插件要实现一个install方法
// $router注册
// 两个全局组件
VueRouter.install = function (_Vue) {
  Vue = _Vue; // 引⽤构造函数，VueRouter中要使⽤

  // 注册router实例
  // 通过全局混入：Vue.mixin({beforeCreate})
  // 为什么要⽤混⼊⽅式写？主要原因是use代码在前，Router实例创建在后，⽽install逻辑⼜需要⽤到该实例
  // 任务1：挂载$router
  Vue.mixin({
    beforeCreate() {
      // 只有根组件拥有router选项 仅在根组件创建时执行一次
      if (this.$options.router) {
        // vm.$router
        Vue.prototype.$router = this.$options.router;
      }
    },
  });

  // 任务2：实现两个全局组件router-link和router-view
  Vue.component("router-view", View);
  // Vue.component("router-view", {
  //   render(h) {
  //     // url => component
  //     // url
  //     // window.location.hash
  //     // router: this.$router
  //     // 动态获取对应组件

  //     // let component = null;
  //     // const { current, options, routeMap } = this.$router;
  //     // const route = options.routes.find((route) => route.path === current);
  //     // if (route) {
  //     //   component = route.component;
  //     // }
  //     // return h(component);

  //     // 提前处理路由表
  //     // 提前处理路由表避免每次都循环
  //     const { routeMap, current } = this.$router;
  //     const component = routeMap[current] ? routeMap[current].component : null;
  //     return h(component);
  //   },
  // });
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      // <router-link to="/about">xxx</router-link>
      // <a href="#/about">xxx</a>
      // return <a href={"#" + this.to}>{this.$slots.default}</a>;
      return h("a", { attrs: { href: "#" + this.to } }, this.$slots.default);
    },
  });
};

export default VueRouter;
