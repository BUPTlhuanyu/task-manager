/*
 * @Descripttion: http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html
 * @Author: lhuanyu
 * @Date: 2020-04-16 11:17:54
 * @LastEditors: lhuanyu
 * @LastEditTime: 2020-04-17 15:49:30
 */

//  http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html
var expect = require('expect.js');

// ts 测试编译后文件
var TaskManager = require('../src/index.ts').default;

let taskFactory = function(time, msg){
  return new Promise((r) => {
    setTimeout(() => {
      r(msg)
    }, time)
  })
}

describe('单元测试', function() {
    this.timeout(1000);

    describe('功能1', function() {
        it('异步缓冲队列', function(done) {
            let runner = new TaskManager(3)
            let res = []
            runner.addTask({task: taskFactory.bind(null, 1000, 1)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
            })
            runner.addTask({task: taskFactory.bind(null, 2000, 2)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
                
            })
            runner.addTask({task: taskFactory.bind(null, 3000, 3)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
                
            })
            runner.addTask({task: taskFactory.bind(null, 3000, 4)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
                
            })
            runner.addTask({task: taskFactory.bind(null, 5000, 5)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
                
            })
            runner.addTask({task: taskFactory.bind(null, 2000, 6)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
                
            })
            runner.addTask({task: taskFactory.bind(null, 1000, 7)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
                
            })
            var f = function() {
                let newRes = res.sort((a, b) => {
                    if(a.time > b.time){
                        return true
                    }
                    return false
                })
                let timeGap = []
                newRes.reduce((prev, next) => {
                    let gap = next.time - prev.time
                    let remainder = gap % 1000
                    let merchant = (gap / 1000) | 0
                    if(Math.abs(remainder) < 25){
                        timeGap.push(merchant)
                    }else if(Math.abs(remainder) > 900){
                        timeGap.push(++merchant)
                    }
                    return next
                })
                console.log(timeGap, res)
                if(global){
                    expect(newRes.map(item => item.value).toString() === '1,2,3,4,6,7,5' || newRes.map(item => item.value).toString() === '1,2,3,4,7,6,5').to.equal(true);
                }else{
                    expect(newRes.map(item => item.value).toString()).to.equal('1,2,3,4,6,7,5');
                }
                
                expect(timeGap.toString()).to.equal('1,1,1,1,0,2');
                done(); // 通知Mocha测试结束
            };
            setTimeout(f, 9000);
        }).timeout(10000);

        it('暂停与恢复', function(done) {
            let runner = new TaskManager(1)
            let res = []
            runner.addTask({task: taskFactory.bind(null, 1000, 1)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })
                runner.stopWaitingPromiseFromNow()
            })
            runner.addTask({task: taskFactory.bind(null, 3000, 2)}).then(data => {
                res.push({
                    value: data,
                    time: Date.now()
                })  
            })
            setTimeout(()=> {
                runner.wakeUp()
            }, 2000);
            var f = function() {
                let newRes = res.sort((a, b) => {
                    if(a.time > b.time){
                        return true
                    }
                    return false
                })
                expect(newRes.map(item => item.value).toString()).to.equal('1,2');
                done(); // 通知Mocha测试结束
            };
            setTimeout(f, 7000);
        }).timeout(8000);
    });

    
});
