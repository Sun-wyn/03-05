// reactive 的实现
// 接收一个参数，判断这参数是不是对象
// 创建拦截器对象 handler, 设置get/set/deleteProperty
// 返回Proxy对象
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

// reactive VS ref
// ref 可以把基本数据类型数据，转换成响应式对象
// ref 返回的对象，重新赋值成对象也是响应式的
// reactive 返回的对象，重新赋值丢失响应式
// reactive 返回的对象不可以解构

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