// import {WaitingTask, Result, TaskOption, ReturnValue} from '../types/TaskManager';
interface WaitingTask {
    task:   any; 
    resolve:   (value: any) => void; 
    timeout:   number;
}
type TaskOption = Pick<WaitingTask, 'task' | 'timeout'>
type ReturnValue<T> = (T) => T
type Result<R> = R[]

class TaskManager {
    private threshold:   number
    private rest:   number
    private readyToRun:   WaitingTask[]
    private result:   Result<any>
    private timeout:   number
    private _stopFromNow:   boolean
    public constructor(threshold: number, timeout: number = 20000){
        this.threshold = threshold;
        this.rest = threshold;  // 还能直接执行多少个task
        this.readyToRun = [];   // 存储等待执行的task，是一个队列，先进先出
        this.result = [];       // 存储已经执行返回的结果
        this.timeout = timeout;
        this._afterTaskCompletedChanged = this._afterTaskCompletedChanged.bind(this);
        this.stopWaitingPromiseFromNow = this.stopWaitingPromiseFromNow.bind(this);
        this.wakeUp = this.wakeUp.bind(this);
        this._stopFromNow = false;
    }
    /**
   * 添加任务，不能立即执行的添加到等待队列，能立即执行的直接执行，执行完成之后自动执行下一个等待任务
   * @param {*} {task, timeout} task需要执行的任务，timeout为此任务的超时时间
   */
    public addTask({task, timeout}: TaskOption): Promise<any>{
        if(this.rest > 0){
            return new Promise((resolve): void =>{
                // 直接执行task，rest减少一个，this.rest表示还能直接执行几个task
                this.rest--;
                resolve(this._promiseWithTimeout(task, timeout));
            }).then(this._afterTaskCompletedChanged, this._afterTaskCompletedChanged);
        }else{
            return new Promise((resolve): void =>{
                // 这里resolve与当前promise实例绑定
                // 原理可以看promise中_resolve的实现
                this.readyToRun.push({task, resolve, timeout});
            });
        }
    }  
    /**
   * 用于用户暂停或者恢复等待中的task的执行
   * @param {*} value
   */
    public stopWaitingPromiseFromNow(): Result<any> {
        this._stopFromNow = true;
        return this.result;
    }

    /**
   * 用于用户暂停或者恢复等待中的task的执行
   * @param {*} value
   */  
    public wakeUp(): Result<any>{
        if(this.rest === this.threshold && this._stopFromNow){
            this._stopFromNow = false;
            this.rest--;
            // 如果没有等待中的任务，那么下面的函数什么都不会做。
            this._runNextTask();
        }
        return this.result;
    }

    /**
   * 任务执行完成之后： 收集task执行后的结果保存到this.result中
   * @param {*} value 
   */
    private _afterTaskCompletedChanged(value): ReturnValue<any>{
        this.result.push(value);
        // 用了定时器来保证了，addTask返回的promise的then的回调先执行，然后再执行下一个等待中的task
        setTimeout(this._runNextTask.bind(this), 0);
        // 这里是为addTask的then回调返回value
        return value;
    }
    /**
   * 用setTimeout伪中断task
   * @param {*} task 
   * @param {*} timeout 
   */
    private _promiseWithTimeout(task: any, timeout: number = this.timeout): Promise<any>{
        let taskPromise, timerId = null;
        if(typeof task === 'function'){
            taskPromise = task(); 
        }else{
            taskPromise = Promise.resolve(task);
        }
        let timeoutPromise = new Promise((resolve): void => {
            timerId = setTimeout((): void => {
                resolve('超时了');
            }, timeout);
        });
        return Promise.race([taskPromise, timeoutPromise]).finally((): void => {
            clearTimeout(timerId);
            timerId = null;
        });
    }
    /**
   * 内部执行器，取一个等待队列执行
   */
    private _runNextTask(): void{ 
        // task状态变化了，那么增加一个直接执行task的名额
        this.rest++;
        if(this._stopFromNow)return; 
        // 如果等待执行的task列表不为空
        if(this.readyToRun.length > 0){
            //console.log(this.readyToRun.length)
            //取出队列中的一个task执行
            let item = this.readyToRun.shift();
            if(item){
                this.rest--;
                // 在task返回的promise的状态变化之后，执行下一个task
                new Promise((resolve): void =>{
                    let {task, resolve: itemResolve, timeout} = item;
                    resolve(
                        this._promiseWithTimeout(
                            (): void => {
                                // 执行task
                                let result = task();
                                // 改变之前addTask将task添加到this.readyToRun的那个promise的状态
                                itemResolve(result);
                                // 必须返回result，这个由task返回的promise
                                return result;
                            },
                            timeout
                        )
                    );
                }).then(this._afterTaskCompletedChanged, this._afterTaskCompletedChanged);          
            }        
        }
    }
}

export default TaskManager;