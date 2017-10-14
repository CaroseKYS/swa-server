+function () {

  let alias ={
    'base'  : ['jquery', 'bootstrap-css'],
    'jquery': 'https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js',
    'bootstrap': ['https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css',
                  'https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js'],
    'bootstrap-css': 'https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css',
    'bootstrap-js': 'https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js',
  };

  let shim = {
    'bootstrap': 'jquery',
    'bootstrap-js': 'jquery'
  };

  /*导出接口*/
  if (typeof exports === 'object') {
    ({alias: exports.alias, shim: exports.shim} = {alias, shim});
  }else if (typeof define === 'object' && define.amd) {
    return define(() => {alias, shim});
  }else if (typeof define === 'object' && define.cmd) {
    return define((require, exports, module) => {
      ({alias: exports.alias, shim: exports.shim} = {alias, shim});
    });
  }else{
    let _global = (function () {
      if (typeof self !== 'undefined') { return self; }
      if (typeof window !== 'undefined') { return window; }
      if (typeof global !== 'undefined') { return global; }
      throw new Error('unable to locate global object');
    })();

    _global.resourcesMap = {alias, shim};
  } 
}();