const polyfill= require('babel-polyfill');
const express = require('express');
const path    = require('path');
const util    = require('util');

const sConfFile = path.join(__dirname, 'swa-conf.js');
/*获取应用运行模式*/
const runPattern = process.env.NODE_ENV === 'production' ? 'production' : 'development';
console.log('\b进程[', process.pid, ']运行环境为: ', runPattern);

/*设置应用对应的环境变量*/
process.env.NODE_SWA_ROOT = __dirname;
process.env.NODE_SWA_CONF = sConfFile;

/*加载应用所需的模块*/
const swaUtils    = require('fdp-utils');
const logger      = require('swa-logger');
const middlewares = swaUtils.getJsonProp(sConfFile, 'middlewares') || {};
const oErrorPath  = swaUtils.getJsonProp(sConfFile, 'error-path' ) || {};

/*创建应用服务器实例*/
const app = express();

/*模板引擎配置*/
app.set('views', path.join(__dirname, 'views'));

/*开发环境下的静态文件服务配置*/
runPattern == 'development'? app.set('view cache', false) : app.set('view cache', true);

app.set('view engine', 'hbs');
app.engine('hbs', require('hbs').__express);

/*站点logo服务*/
if (fnIfUseMiddleware('serve-favicon')) {
  app.use(require('serve-favicon')(path.join(__dirname, 
    swaUtils.getJsonProp(sConfFile, 'serve-favicon.icon-path'))));
}

/*记录请求日志的中间件*/
mountMiddleware('swa-middleware-logger');

/*解析请求体的中间件，必须开启*/
const bodyParser     = require('body-parser');
const bodyParserConf = swaUtils.getJsonProp(sConfFile, 'body-parser') || {};

app.use(bodyParser.json(      bodyParserConf['json']      || {} ));
app.use(bodyParser.urlencoded(bodyParserConf['urlencoded']|| {} ));
app.use(bodyParser.text(      bodyParserConf['text']      || {} ));

/*解析cookie的中间件*/
mountMiddleware('cookie-parser', factory => factory());

/*解析session的中间件*/
mountMiddleware('swa-session', factory => factory());

/*单点登录服务器*/
// mountMiddleware('swa-sso-server', factory => factory(app));

/*单点登录客户端*/
// mountMiddleware('swa-sso-client', factory => factory(app));

/*安全中间件*/
mountMiddleware('swa-security', factory => factory());

/*加载数据代理*/
// global.dataproxy = require('swa-data-proxy');
global.logger    = logger;

/*浏览器ajax统一入口*/
// mountMiddleware('fdp-ajax-proxy');

/*加载应用特有的配置*/
require('./conf/app-local.js')(app, runPattern);

/*静态文件服务器配置*/
app.use('/s/biz', express.static(path.join(__dirname, 'static/biz'    )));
app.use('/s/ven', express.static(path.join(__dirname, 'static/vendors')));
app.use(          express.static(path.join(__dirname, 'static/root'   )));
app.use(          express.static(path.join(__dirname, 'views/html'    )));

// 处理404
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 错误处理
app.use((err = {}, req, res, next) => {
  if (err && err.code == 'EPERM') {
    logger.warn('swa|app.js|error: EPERM|该异常是开发环境中读取session文件时引发, 可忽略.');
    next();
    return;
  }

  err = err ||{};
  err.status = err.status || 500;

  logger.error('swa|app.js|express error');
  logger.error(err);

  res.status(err.status);

  var path;
  switch(err.status){
    case  404 :
    case '404':
      logger.error(`404|Not Found|Path: ${req.originalUrl}`);
      path = oErrorPath['404'] || '404/404';
      break;
    case  500 :
    case '500':
      path = oErrorPath['500'] || '500/500';

  }

  res.render(path);
});

//未捕获的异常处理
app.use((err, req, res, next) => {
  logger.error('Uncaught Express Exception');
  logger.error(err);
  res.setHeader('context-type', 'text/plain; charset=utf-8');
  res.end('服务器发生未知错误，请与管理员联系。');
});

/*处理进程未捕获的异常*/
process.on('uncaughtException', err => {
  logger.error('Uncaught Process Exception');
  logger.error(err);
});

module.exports = app;

/**
 * 用于根据配置文件挂载中间件
 * @author 康永胜
 * @date   2017-10-13
 * @param  {String}                 middlewareName [description]
 * @param  {Function}                 generator      [description]
 * @return {[type]}                                [description]
 */
function mountMiddleware(middlewareName, generator) {
  var conf = middlewares[middlewareName];
  var mountPath;
  var middleware;

  if (!conf || !conf.enabled) return;

  mountPath  = conf['mount-path'];
  middleware = require(middlewareName);
  middleware = util.isFunction(generator)? generator(middleware) : middleware

  if (!mountPath || mountPath === '/') {
    app.use(middleware);
    return;
  }

  app.use(mountPath, middleware);
}