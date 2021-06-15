// 数组响应式
// 1、替换数组原型中的 7个方法
const orginalProto = Array.prototype
// 备份一份，修改备份
const arrayProto = Object.create(orginalProto);
['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  arrayProto[method] = function () {
    // 原始操作
    orginalProto[method].apply(this, arguments)
    // 覆盖操作，通知更新
    console.log('数组执行' + method + '操作')
  }
})

// 给一个obj定义一个响应式的属性
function defineReactive(obj, key, val) {
  // 递归
  // val如果是个对象，就需要递归处理
  observe(val);

  // 创建Dep实例
  const dep = new Dep()
  
  Object.defineProperty(obj, key, {
    get() {
      console.log("get", key);
      // 依赖关系收集
      Dep.target && dep.addDep(Dep.target)
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set", key);
        val = newVal;
        // 新值如果是对象，仍然需要递归遍历处理
        observe(newVal);
        // update()
        dep.notify()
      }
    },
  });
}

// 遍历响应式处理
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return obj;
  }

  new Observer(obj);
}

// 能够将传入对象中的所有key代理到指定对象上
function proxy(vm) {
  Object.keys(vm.$data).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key];
      },
      set(v) {
        vm.$data[key] = v;
      },
    });
  });
}

class Observer {
  constructor(obj) {
    // 判断传入obj类型，做相应处理
    if (Array.isArray(obj)) {
      // 数组todo
      // 覆盖原型，替换7个变更操作
      obj.__proto__ = arrayProto
      // 对数组内部元素执行响应化
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
        observe(obj[i])
      }
    } else {
      this.walk(obj);
    }
  }

  walk(obj) {
    Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
  }
}

class RVue {
  constructor(options) {
    // 0.保存选项
    this.$options = options;
    this.$data = options.data;

    // 1.对data做响应式处理
    observe(options.data);

    // 2.代理
    proxy(this);

    // 3.编译
    new Compile(options.el, this);
  }
}

// 编译
class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    if (this.$el) {
      this.compile(this.$el);
    }
  }

  // 遍历node，判断节点类型，做不同处理
  compile(node) {
    const childNodes = node.childNodes;

    Array.from(childNodes).forEach((n) => {
      // 判断类型
      if (this.isElement(n)) {
        // console.log('编译元素', n.nodeName);
        this.compileElement(n);
        // 递归
        if (n.childNodes.length > 0) {
          this.compile(n);
        }
      } else if (this.isInter(n)) {
        // 动态插值表达式
        // console.log('编译文本', n.textContent);
        this.compileText(n);
      }
    });
  }

  isElement(n) {
    return n.nodeType === 1;
  }

  // 形如{{ooxx}}
  isInter(n) {
    return n.nodeType === 3 && /\{\{(.*)\}\}/.test(n.textContent);
  }

  // 编译插值文本 {{ooxx}}
  compileText(n) {
    // 获取表达式
    // n.textContent = this.$vm[RegExp.$1];
    this.update(n, RegExp.$1, "text");
  }

  // 编译元素：遍历它的所有特性，看是否r-开头指令，或者@事件
  compileElement(n) {
    const attrs = n.attributes;
    Array.from(attrs).forEach((attr) => {
      // r-text="xxx"
      // name = r-text,value = xxx
      const attrName = attr.name;
      const exp = attr.value;
      // 指令
      if (this.isDir(attrName)) {
        // 执行特定指令处理函数
        const dir = attrName.substring(2);
        this[dir] && this[dir](n, exp);
      }

      // 事件处理
      if(this.isEvent(attrName)){
        // @click="onclick"
        // exp click
        const dir = attrName.substring(1) // click
        // 事件监听
        this.eventhandler(n, exp, dir)
      }
    });
  }

  update(node, exp, dir) {
    // 1.init
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])

    // 2.update
    new Watcher(this.$vm, exp, val => {
      fn && fn(node, val)
    })
  }

  // r-text
  text(node, exp) {
    this.update(node, exp, "text");
  }

  textUpdater(node, val) {
    node.textContent = val;
  }

  // r-html
  html(node, exp) {
    this.update(node, exp, "html");
  }

  htmlUpdater(node, val) {
    node.innerHTML = val;
  }

  // r-model
  model(node, exp){
    // 只完成赋值和更新
    this.update(node, exp, "model")

    // 事件监听
    node.addEventListener('input', e=>{
      // 新的值赋值给数据即可
      this.$vm[exp] = e.target.value
    })
  }

  modelUpdater(node, val) {
    node.value = val;
  }

  isDir(attrName) {
    return attrName.startsWith("r-");
  }

  isEvent(attrName){
    return attrName.startsWith("@");
  }

  eventhandler(node, exp, dir){
    // method: {onclick:function(){}}
    const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
    node.addEventListener(dir, fn.bind(this.$vm))
  }
}

// 负责dom更新
class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm;
    this.key = key;
    this.updater = updater;

    // 触发一下get
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  // 将来会被Dep调用
  update() {
    this.updater.call(this.vm, this.vm[this.key]);
  }
}

// 保存watcher实例的依赖类
class Dep {
  constructor() {
    this.deps = []
  }
  // 此处dep就是Watcher的实例
  addDep(dep) {
    // 创建依赖关系时调用
    this.deps.push(dep)
  }
  notify() {
    this.deps.forEach(dep => dep.update())
  }
}