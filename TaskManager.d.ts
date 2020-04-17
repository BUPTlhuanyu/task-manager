interface WaitingTask {
    task: any;
    resolve: (value: any) => void;
    timeout: number;
}
declare type TaskOption = Pick<WaitingTask, 'task' | 'timeout'>;
declare type Result<R> = R[];
declare class TaskManager {
    private threshold;
    private rest;
    private readyToRun;
    private result;
    private timeout;
    private _stopFromNow;
    constructor(threshold: number, timeout?: number);
    /**
   * 添加任务，不能立即执行的添加到等待队列，能立即执行的直接执行，执行完成之后自动执行下一个等待任务
   * @param {*} {task, timeout} task需要执行的任务，timeout为此任务的超时时间
   */
    addTask({ task, timeout }: TaskOption): Promise<{}>;
    /**
   * 用于用户暂停或者恢复等待中的task的执行
   * @param {*} value
   */
    stopWaitingPromiseFromNow(): Result<any>;
    /**
   * 用于用户暂停或者恢复等待中的task的执行
   * @param {*} value
   */
    wakeUp(): Result<any>;
    /**
   * 任务执行完成之后： 收集task执行后的结果保存到this.result中
   * @param {*} value
   */
    private _afterTaskCompletedChanged;
    /**
   * 用setTimeout伪中断task
   * @param {*} task
   * @param {*} timeout
   */
    private _promiseWithTimeout;
    /**
   * 内部执行器，取一个等待队列执行
   */
    private _runNextTask;
}
export default TaskManager;
