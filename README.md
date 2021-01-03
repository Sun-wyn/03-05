### 1、Vue 3.0 性能提升主要是通过哪几方面体现的？

​	vue 3.0 性能提升有三个方面，首先使用Proxy对象重新了响应式系统，其次通过优化编译的过程和重写虚拟dom提升渲染的性能，通过优化源码的体积和更好的tree-shaking的支持减少打包的体积

- 响应式系统提升

  - Vue.js 2.x 中响应式系统的核心 defineProperty
  - Vue.js3.0 中使用 Proxy 对象重写响应式系统
    - 可以监听动态新增的属性
    - 可以监听删除的属性
    - 可以监听数组的索引和 length 属性

- 编译优化

  - Vue.js 2.x 中通过标记静态根节点，优化 diff 的过程，会跳过静态根节点，但是静态节点还会再diff
  - Vue.js 3.0 中标记和提升所有的静态根节点，diff 的时候只需要对比动态节点内容
    - Fragments (片断)，模块中不需要再创建一个唯一的根节点，可以直接放文本内容或很多同级的标签
    - 静态提升，静态节点会被提升的render函数的外面，这些节点只有在初始化的时候被创建一次，再调用render的时候不需要再创建
    - Patch flag，diff 的时候只会根据patch flag 进行比较，提高了虚拟dom diff的性能
    - 缓存事件处理函数，首次渲染的时候会生成一个新的函数缓存事件处理函数，再次调用render的时候会直接从缓存中获取这个函数

- 源码体积的优化

  优化打包体积：vue.js 3.0 中移除了一些不常用的 API，例如：inline-template、filter等，另外对 Tree-shaking 的支持更好，通过编译阶段的静态分析找到没有引入的模块在打包的时候过滤掉，能在打包后的体积理小，vue.js 3.0 在设计之初就考虑到了Tree-shaking，内置的组件比如transition、keep-alive，和一些内置的指令比如v-modle都是按需引入的，所以vue.js 3.0 中的新增的 api 也是支持 Tree-shaking，如果没有使用不会被打包的，核心模块会打包

### 2、Vue 3.0 所采用的 Composition Api 与 Vue 2.x使用的Options Api 有什么区别？

- Vue 2.x Options Api
  - 包含一个描述组件选项(data、methods、props、computed、watch等)的对象
  - Options Api 开发复杂组件，同一个功能逻辑的代码拆分到到不同选项，代码量变大，导致后续维护非常的复杂
- Vue 3.0 Composition Api
  - 是一基于函数的 Api
  - Composition Api 开发复杂组件，同一个功能逻辑的代码可以封装在一个函数中，还可以把组件中的代码提取出来，有利于代码的重用

### 3、Proxy 相对于 Object.defineProperty 有哪些优点？

- Proxy
  - Proxy 可以直接监听对象而非属性
  - Proxy 可以直接监听数组的变化
  - Proxy 有多达 13 种拦截方法,不限于 apply、ownKeys、deleteProperty、has 等等是 Object.defineProperty 不具备的
  - Proxy 返回的是一个新对象,我们可以只操作新的对象达到目的,而 Object.defineProperty 只能遍历对象属性直接修改
  - Proxy 作为新标准将受到浏览器厂商重点持续的性能优化，也就是传说中的新标准的性能红利
- Object.defineProperty
  - 兼容性好，支持 IE9，而 Proxy 的存在浏览器兼容性问题

### 4、Vue 3.0 在编译方面有哪些优化？

​	Vue.js 3.0 中标记和提升所有的静态根节点，diff 的时候只需要对比动态节点内容

- Fragments (片断)，模块中不需要再创建一个唯一的根节点，可以直接放文本内容或很多同级的标签

- 静态提升，静态节点会被提升的render函数的外面，这些节点只有在初始化的时候被创建一次，再调用render的时候不需要再创建
- Patch flag，diff 的时候只会根据patch flag 进行比较，提高了虚拟dom diff的性能
- 缓存事件处理函数，首次渲染的时候会生成一个新的函数缓存事件处理函数，再次调用render的时候会直接从缓存中获取这个函数

### 5、Vue.js 3.0 响应式系统的实现原理？

Vue.js 3.0 使用 Proxy 对象重写响应式系统，由以下几个函数组成：

- reactive

  - 接收一个参数，判断这参数是不是对象，不是对象则直接返回，不做响应式处理
  - 创建拦截器对象 handler, 设置get/set/deleteProperty
    - get
      - 收集依赖
      - 返回当前 key 的值，如果是对象使用 reactive转换成响应式对象，否则直接返回target
    - set
      - 新值和旧值不相等更新为新值，并触发更新
    - deleteProperty
      - 删除当前对象中的key属性，返回是否成功，并触发更新
  - 返回 Proxy 对象

- effect

  - 接收一个函数作为参数
  - 访问响应式对象属性，去收集依赖

- track

  - 接收两个参数 target 和 key
  - 判断是否有 activeEffect，如果没有，则没有创建 effect 依赖，如果有，判断 WeakMap 集合中是否有 target 属性
    - WeakMap 集合中没有 target 属性，则 targetMap.set(target, (depsMap = new Map()))
    - WeakMap 集合中有 target 属性，则判断 target 属性的 map 值的 depsMap 中是否有 key 属性
      - depsMap 中没有 key 属性，则 set(key, (dep = new Set()))
      - depsMap 中有 key 属性，则添加这个 activeEffect

- trigger

  - 判断 WeakMap 中是否有 target 属性
    - WeakMap 中没有 target 属性，则没有 target 相应的依赖
    - WeakMap 中有 target 属性，则判断 target 属性的 map 值中是否有 key 属性，有的话循环触发收集的 effect()

- 代码如下

  ```javascript
  
  const isObject = val => val !== null && typeof val === 'object'
  // 判断 target 是否是对象，如果是对象使用 reactive转换成响应式对象，否则直接返回target
  const convert = target => isObject(target) ? reactive(target) : target
  const hasOwnProperty = Object.prototype.hasOwnProperty
  // 判断target对象中是否有key这个属性
  const hasOwn = (target, key) => hasOwnProperty.call(target, key)
  
  export function reactive (target) {
    if (!isObject(target)) return target
    const handler = {
      get (target, key, receiver) {
        // 收集依赖
        track(target, key)
        const result = Reflect.get(target, key, receiver)
        return convert(result)
      },
      set (target, key, value, receiver) {
        const olcValue = Reflect.get(target, key, receiver)
        let result = true
        if (olcValue !== value) {
          // Reflect.set 会返回一个布尔类型的值标致赋值是否成功
          result = Reflect.set(target, key, value, receiver)
          // 触发更新
          trigger(target, key)
        }
        return result
      },
      deleteProperty (target, key) {
        const hasKey = hasOwn(target, key)
        // 删除target中的key属性，并返回是否成功
        const result = Reflect.deleteProperty(target, key)
        if (hasKey && result) {
          // 触发更新
          trigger(target, key)
        }
        return result
      }
    }
    return new Proxy(target, handler)
  }
  
  let activeEffect = null
  // 收集依赖
  export function effect (callback) {
    activeEffect = callback
    callback() //访问响应式对象属性，去收集依赖
    // 收集完成 activeEffect 设置为 null
    activeEffect = null
  }
  let targetMap = new WeakMap()
  export function track (target, key) {
    if (!activeEffect) return
    // 当前的 target 是 targetMap 中的键
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
  }
  // 触发更新
  export function trigger (target, key) {
    // depsMap存储的是属性以及dep的集合，dep中的存储的是属性以及dep函数
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const dep = depsMap.get(key)
    if (dep) {
      dep.forEach(effect => {
        effect()
      })
    }
  }
  export function ref (raw) {
    // 判断 raw 是否是ref 创建的对象，如果是直接返回
    if (isObject(raw) && raw.__v_isRef) return
    let value = convert(raw)
    const r  = {
      __v_isRef: true,
      get value () {
        track(r, 'value')
        return value
      },
      set value (newValue) {
        if (newValue !== value) {
          raw = newValue
          value = convert(raw)
          trigger(r, 'value')
        }
      }
    }
    return r
  }
  export function toRefs (proxy) {
    const ret = proxy instanceof Array ? new Array(proxy.length) : {}
    for (const key in proxy) {
      ret[key] = toProxyRef(proxy, key)
    }
    return ret
  }
  function toProxyRef (proxy, key) {
    const r = {
      __v_isRef: true,
      get value () {
        return proxy[key]
      },
      set value (newValue) {
        proxy[key] = newValue
      }
    }
    return r
  }
  export function computed (getter) {
    const result = ref()
    effect(() => (result.value = getter()))
    return result
  }
  ```

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  



