// 核⼼概念
// state 状态、数据
// getters 派⽣状态 从state派⽣出新状态，类似计算属性
// mutations 更改状态的函数
// actions 异步操作 添加业务逻辑，类似于controller
// store 包含以上概念的容器

// 实现一个插件
// 实现Store类
let Vue;

class Store {
  constructor(options) {
    // 保存⽤户配置的mutations选项
    this._mutations = options.mutations;
    // 保存⽤户编写的actions选项
    this._actions = options.actions;
    // 响应式处理的数据
    // this.state = new Vue({
    //   data: options.state
    // })
    // setInterval(() => {
    //   this.state.counter++
    // }, 1000);

    // 维持⼀个响应式状态state
    this._vm = new Vue({
      data: {
        // 添加$$, Vue就不会代理
        $$state: options.state,
      },
    });

    // 实现commit()
    this.commit = this.commit.bind(this);
    // 实现dispatch()
    this.dispatch = this.dispatch.bind(this);
    // getters

    // 绑定commit上下⽂否则action中调⽤commit时可能出问题!!
    // 同时也把action绑了，因为action可以互调
    // const store = this
    // const {commit, action} = store
    // this.commit = function boundCommit(type, payload) {
    //   commit.call(store, type, payload)
    // }
    // this.action = function boundAction(type, payload) {
    //   return action.call(store, type, payload)
    // }
  }

  get state() {
    return this._vm._data.$$state;
  }

  set state(v) {
    console.error("请使用replaceState重置状态");
  }

  // 修改状态，commit('add', payload)
  commit(type, payload) {
    // 获取type对应的mutation
    const entry = this._mutations[type];
    if (!entry) {
      console.error(`unknown mutation type: ${type}`);
      return;
    }
    // 指定上下⽂为Store实例
    // 传递state给mutation
    entry(this.state, payload);
  }

  // dispatch('add', payload)
  dispatch(type, payload) {
    // 获取⽤户编写的type对应的action
    const entry = this._actions[type];

    if (!entry) {
      console.error(`unknown action type: ${type}`);
      return;
    }
    // 异步结果处理常常需要返回Promise
    return entry(this, payload);
  }
}

// 挂载$store
function install(_Vue) {
  Vue = _Vue;

  // 注册$store
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store;
      }
    },
  });
}

// 现在导出的就是Vuex
export default { Store, install };
