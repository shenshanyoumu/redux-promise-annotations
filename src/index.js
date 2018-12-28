import isPromise from "is-promise";
import { isFSA } from "flux-standard-action";

export default function promiseMiddleware({ dispatch }) {
  return next => action => {
    // FLUX规范的action对象，具有type、payload，以及其他meta字段
    // 如果action不符合FSA，则判定action是否为promise对象
    // (1)action是promise对象，则将dispatch参数传递给action.then
    //（2）如果action既不符合FSA又不是promise对象，则传递下一个中间件处理
    if (!isFSA(action)) {
      return isPromise(action) ? action.then(dispatch) : next(action);
    }

    // 如果action对象的payload字段为promise形式，则执行promise并在then方法中触发dispatch
    return isPromise(action.payload)
      ? action.payload
          .then(result => dispatch({ ...action, payload: result }))
          .catch(error => {
            dispatch({ ...action, payload: error, error: true });
            return Promise.reject(error);
          })
      : next(action);
  };
}
