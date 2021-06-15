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
  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log("get", key);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set", key);
        val = newVal;
        // 新值如果是对象，仍然需要递归遍历处理
        observe(newVal)
        // update()
      }
    },
  });
}

// 遍历响应式处理
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return obj;
  }

  // 判断传入obj类型
  if (Array.isArray(obj)) {
    // 覆盖原型，替换7个变更操作
    obj.__proto__ = arrayProto
    // 对数组内部元素执行响应化
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      observe(obj[i])
    }
  } else {
    Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
  }

}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}

const obj = {
  foo: 'foo',
  bar: 'bar',
  baz: {
    n: 1
  },
  ya: []
};
// defineReactive(obj, "foo", "foo");
observe(obj)
// obj.foo;
// obj.baz = {
//   n: 10
// }
// obj.baz.n
// obj.dong = 'dong'
set(obj, 'dong', 'dong')
obj.dong
obj.ya.push(2)
obj.ya
console.log(obj.ya)
