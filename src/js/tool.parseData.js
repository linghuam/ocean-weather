import Papa from 'papaparse'

export function ParseData (url, stepCallback, completeCallback, context) {
  var options = {
    download: true, // 表示第一个参数是请求路径
    header: false, // true则每行是 {key1:value1, key2:value2, key3:value3}, false则每行是 [val1, val2, val3]
    dynamicTyping: true //自动转换类型
  };
  if (typeof stepCallback === 'function') {
    options.step = stepCallback.bind(context || this);
  }
  if (typeof completeCallback === 'function'){
    options.complete = completeCallback.bind(context || this);
  }
  Papa.parse(url, options);
}
