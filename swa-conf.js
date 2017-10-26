'use strict';
/**
 * swa框架的全局配置信息
 * 业务开发人员请勿修改
 * @author 康永胜
 * @date   2017-10-11
 */

const util = require('util');
const path = require('path');

/*获取fis的media信息*/
let   fisMedia = '__CURRENT-SWA-FIS3-MEDIA__';

if (fisMedia === '__CURRENT-SWA-FIS3-MEDIA__') {
  fisMedia = (global.fis && global.fis.project.currentMedia()) || 'development';
}

switch(fisMedia){
  case 'dev':
    fisMedia = 'development';
    break;
  case 'test-no-opti':
    fisMedia = 'test';
    break;
  case 'preproduction-no-opti':
    fisMedia = 'preproduction';
    break;
  case 'production-no-opti':
    fisMedia = 'production';
    break;
}

/*获取配置文件*/
const confPath      = path.join(__dirname, 'conf');
const oUserConfig   = require(path.join(confPath, `swa-conf-${fisMedia}.js`));
const oSecretConfig = require(path.join(confPath, 'swa-conf-secret.js'));

/*----------------配置信息开始----------------*/
const oConfig = {
  /*服务器端口号*/
  'server-port': 3000,

  /*上下文及多应用挂载配置*/
  'context-and-multi-apps': {
    // 'self': {
    //   'context-path': ''
    // },
    // 'app2': {
    //   'context-path': '/app2'
    // }
  },

  /*部署信息配置*/
  'deploy': {
    'evn': fisMedia, // 发布环境, 发布工具自动填写, 请勿修改
    'swa-server': { // web应用服务器部署配置
      'debug-prot': 5858, // 调试端口, 只有 evn 为 development 的时候才生效
      'uri-to-open-after-running': '', // 部署完成之后需要自动打开的 uri, 只有 evn 为 development 的时候才生效
      'application-to-open-uri': 'chrome', // 打开uri的应用程序，如chrome, iexplore, firefox等
      'receivers': [// 接收部署文件的接收器
        {
          // 'url' : 'http://www.internmen.cn/receiver', // 有该属性表示为远程部署，反之为本地部署
          'real-path' : path.join(__dirname, '..', 'swa-deploy'), /*部署路径*/
        }
      ]
    },

    // 'cdn-static': { // 静态资源cdn部署配置, 若无该配置, 则继承 swa-server 的配置
    //   'url-prefix': 'https://cdn.internmen.cn', // 内容访问路径的前缀, 即cdn地址
    //   'receivers': [ // 该配置与 swa-server 的配置项含义相同
    //     {
    //       // 'url' : 'http://cdn.internmen.cn/receiver',
    //       'real-path' : '/cdn/static'
    //     }
    //   ]
    // },

    // 'cdn-biz':{ // 业务cdn部署配置, 若无该配置, 则继承 swa-server 的配置, 配置项含义参考 cdn-static
    //   'url-prefix': 'https://cdn.internmen.cn',
    //   'receivers': [
    //     {
    //       // 'url' : 'http://cdn.internmen.cn/receiver',
    //       'real-path' : '/cdn/biz'
    //     }
    //   ]
    // },
  },

  /*中间件开关，'true'表示开启，'false'表示关闭，不配置默认开启*/
  'middlewares': {
    //为站点提供入口控制服务的中间件
    'swa-getway': {
      'enabled': false,
      'mount-path': '/'
    },

    //为站点提供logo的中间件
    'serve-favicon': {
      'enabled': true
    },

    //记录请求日志的中间件
    'swa-middleware-logger': {
      'enabled': true,
      'mount-path': '/'
    },

    //解析cookie的中间件
    'cookie-parser': {
      'enabled': true,
      'mount-path': '/'
    },

    //处理session的中间件
    'swa-session': {
      'enabled': true,
      'mount-path': '/'
    },

    //单点登录的服务器中间件
    'swa-sso-server': {
      'enabled': false,
      'mount-path': '/'
    },

    //单点登录的客户端中间件
    'swa-sso-client': {
      'enabled': false,
      'mount-path': '/'
    }
  },

  /*异常界面路径*/
  'error-path': {
    '404': '404/404.hbs',
    '500': '500/500.hbs'
  },

  /*站点图标中间件*/
  'serve-favicon': {
    //图标路径，以应用根目录为起始目录。
    'icon-path': '/favicon.ico'
  },

  /*配置 body-parser 中间件*/
  'body-parser': {
    'json': {
      'limit': '128kb',
      'type': 'application/json'
    },
    'urlencoded': {
      'limit': '128kb',
      'extended': false,
      'type': 'application/x-www-form-urlencoded'
    },
    'text': {
      'limit': '128kb',
      'extended': false,
      'type': 'text/plain'
    }
  }

};
/*----------------配置信息结束----------------*/

fnMergConf(oUserConfig, oConfig);
fnMergConf(oSecretConfig, oConfig);

module.exports = oConfig;