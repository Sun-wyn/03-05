### Vue3.0 与 vue2.0 的区别

vue3.0虽然已重写但是百分之九十的api还是兼容2.x

- 源码组织方式的变化

  3.0的源码全部使用typeScript重写，项目的组织方式发生变化，使用monorap的方式来组织项目的结构，把独立的功能模块都提取到不同的包中

- 增加Composition API

  组合API是用来

- 性能提升

- Vite

### 构建版本

![image-20201221105052449](/Users/ironman/Library/Application Support/typora-user-images/image-20201221105052449.png)

- cjs

  `vue.cjs.js`    完全版的vue 包含运行时和编译器    开发版 没有压缩

  `vue.cjs.prod.js` 完全版的vue 包含运行时和编译器  生产版  代码压缩

- global

  `vue.global.js` 完全版的vue 包含运行时和编译器  开发版 没有压缩

  `vue.global.prod.js` 完全版的vue 包含运行时和编译器  生产版  代码压缩

  `vue.runtime.global.js` 只包含运行时 开发版 没有压缩

  `vue.runtime.global.prod.js` 只包含运行时 生产版  代码压缩

  这四个文件都可以在浏览器中通过script标签来导入，导入之后会增加一个全局的vue对象

- Browser

  `vue.esm-browser.js`  完全版的vue 包含运行时和编译器 开发版

  `vue.esm-browser.prod.js`  完全版的vue 包含运行时和编译器 生产版

  `vue.runtime.esm-browser.js` 只包含运行时 开发版 

  `vue.runtime.esm-browser.prod.js`  只包含运行时 生产版 

  这四个文件都是原生模块化的文件，可以在浏览器中通过`<script type='module'></script>`来导入

- Bundler

  `vue.esm-bundler.js`   完全版的vue 包含运行时和编译器 

  `vue.runtime.esm-bundler.js` 只包含运行时 开发版  使用脚手架构建的项目默认引用的这个文件，它是vue的最小版本打包时，只引入我们使用到的模块

  这两个文件没有打包所有的代码，需要配合打包工具使用，都是使用ES Moudule，内部通过使用import 导入了runtimecall

### Composition API

- 发展背景

  使用传统的option配置方法写组件的时候问题，随着业务复杂度越来越高，代码量会不断的加大；由于相关业务的代码需要遵循option的配置写到特定的区域，导致后续维护非常的复杂，同时代码可复用性不高，而composition-api就是为了解决这个问题而生的

- 语法糖介绍

  - setup ()

    

    ```javascript
     // createApp 创建vue对象
    const app = createApp({
      // setup 是 composition API的入口
      // 第一个参数 props 响式对象 接收外部传入的参数
      // 第二个参数 context: attrs, emit, slots
      // setup返回的对象可以使用在模板、methods、computed、生命周期的钩子函数中
      // setup执行时机，是在props被解析完毕，组件实例创建之前执行，
      // 所以在setup内部this获取不到组件实例，因为组件实例还没有创建完成,data、methods、					computed等也无法获取，其this指向undefined
      setup () {
        const position = {
          x: 0,
          y: 0
        }
        return {
        	position
        }
      }
    	
    })
    app.mount('#app')
    ```

  - reactive () 

    把一个对象转换成响应式对象，该对象的嵌套属性也会转换成响应式对象 ， 相当于当前的 Vue.observable () API，经过reactive处理后的对象能变成响应式的数据，类似于option api里面的data属性的值

    ```javascript
    createApp({
      setup(){
        // reactive 用来创建响应式对象
        const position = reactive({
          x: 0,
          y: 0
        })
        return {
        	position
        }
      }
    }).mount('#app')
    ```

  - 生命周期钩子函数

    Setup() 是在beforeCreate和beforeCreated之间执行的,所以在setup生命周期钩子函数中不需要有对应的实现，其它生命周期钩子函数的实现需要在对应的函数前加上'on'

    ![image-20201222154446606](/Users/ironman/Library/Application Support/typora-user-images/image-20201222154446606.png)

    注意：

    ​	unmounted和onUnmounted函数相当于vue2.0中的destoryed，调用组件的mount方法会触发onMounted钩子函数，调用组件的unmounted方法会触发onUnmounted钩子函数，

    ​	render函数被重新调用时触发

    ​	![image-20201222155635968](/Users/ironman/Library/Application Support/typora-user-images/image-20201222155635968.png)

    renderTracked在首次调用的时候会触发，renderTriggered在首次调用的时候不会触发

  - toRefs

    toRefs要求传入的参数必须量一个代理对象，如果传入的不是代理对象会报错，提示传入代理对象，toRefs内部创建一个新的对象，遍历传入的代理对象的所有属性转换成响应式对象，然后挂载到新创建的对象上，把新创建的对象返回，内部会为代理对象的每一个属性创建一个value属性，该对象是响应式的，value属性具有getter和setter，getter中返回代理对象的属性的值，setter中给代理对象的属性赋值，所以代理对象的内部属性都是响应式的。

    ```javascript
    createApp({
      setup(){
        // reactive 用来创建响应式对象
        const position = reactive({
          x: 0,
          y: 0
        })
        return {
          //转成响应式对象
        	toRefs(position) 
        }
      }
    }).mount('#app')
    ```

  - ref

    ref的作用是把基本数据类型包装成响应式数据，而reactive 把一个对象转换成响应式数据

    ref中的数据如果是对象，内部会调用reactive转换成响应式数据

    ref中的数据如果是基本类型，它内部会创建一个具有value属性的对象，value属性有getter 和 setter

    ```html
     <div id="app">
        <button @click="increase">按钮</button>
        <span>{{ count }}</span>
      </div>
    ```

    ```javascript
    
    function useCount () {
     //基本类型数据 包装成响应式数据  
      const count = ref(0)
      return {
        count,
        increase: () => {
          count.value++
        }
      }
    }
    createApp({
      setup () {
        return {
          ...useCount()
        }
      }
    }).mount('#app')
    ```

  - computed

    作用减化模板中的代码，缓存计算的结束，当数据变化后才会重新计算

    第一种用法，传入一个获取值的函数，函数内部依赖响应式的数据，当数据发生变化后，会重新执行该函数获取数据

    ```javascript
    watch(()=>count.value+1)
    ```

    第二种用法，传入一个对象，这个对象具有getter和setter，例如

    ```javascript
    const count = ref(1)
    const plusOne = computed({
      get: () => count.value + 1,
      set: val => {
        count.value = val - 1
      }
    })
    ```

    computed返回一个不可变的响应式对象，类似与使用ref创建的对象，只有一个value属性，获取计算属性的值要通过value属性来获取，模板中使用计算属性可以省略value

  - watch

    它的使用和组件中的watch方法和 this.$watch方法使用是一样的，作用是监听响应数据的变化，然后执行一个相应的回调函数，可以获取到监听数据的新值和旧值

    watch的三个参数

    - 第一个参数：要监听的数据，可以是一个获取值的函数，监听这个函数返回值的变化，或都是ref或reactive返回的对象，还可以是数组
    - 第二个参数：监听到数据变化后执行的函数，这个函数分别有两个参数新值和旧值
    - 第三个参数：选项对象，deep深度监听和immediate立即执行

    watch的返回值

    - 取消监听的函数

  - watchEffect

    - 是watch函数的简化版，也用来监视数据的变化，内部实现是和watch调用的同一个函数doWatch，和watch不同的是第二个参数的函数没有参数，
    - 接收一个函数作为参数，监听函数内响应式数据的变化，会立即执行一次这个函数，当数据变化后会重新运行该函数
    - 返回一个取消监听的函数

