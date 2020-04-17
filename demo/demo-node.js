var TaskManager = require('../src/index.ts').default;
let runner = new TaskManager(3)
let taskFactory = function(time, msg){
  return new Promise((r) => {
    setTimeout(() => {
      r(msg)
    }, time)
  })
}
runner.addTask({task: taskFactory.bind(null, 1000, 1)}).then(data => {
  console.log(data)
})
