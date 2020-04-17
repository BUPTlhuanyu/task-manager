# 文档
这是一个用于管理异步Promise的库，内部会维护一个异步缓冲队列，当某个异步执行任务完成则从等待的异步任务中挑选一个执行,并且支持暂停与恢复。

## addTask
用于将task添加到异步缓冲队列

- param {{task: *, timeout}} task可以是任意类型需要执行的异步任务，timeout是该任务执行的时间限制，单位毫秒
- return {void} 返回一个promise，该promise与添加的task中返回的异步结果对应。

举个例子

```js
  runner.addTask({task: function(){return new Promise((r, j)=>{/*...*/})}}).then(data => {
    // do something
  })
  runner.addTask({task: 1}).then(data => {
    // do something
  })  
```

## stopWaitingPromiseFromNow
用于取消后续等待中的task的执行，比如前面的异步任务返回的结果达到了某个条件，那么就停止后面的所有任务的执行

- return {any[]} 返回已经执行完成的task返回的结果数组

举个例子

```js
  runner.stopWaitingPromiseFromNow()
```

## addTask
用于恢复后续等待中的task的执行

- return {any[]} 返回已经执行完成的task返回的结果数组，与stopWaitingPromiseFromNow返回的结果不一样，因为stopWaitingPromiseFromNow执行的时候只能拿到已经执行完成的task的返回结果，那些还在执行中的task的结果是获取不到的。

举个例子

```js
  runner.wakeUp()
```
