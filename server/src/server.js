const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const favicon = require('koa-favicon')
const helmet = require('koa-helmet')
const morgan = require('koa-morgan')
const passport = require('koa-passport')
const path = require('path')
const session = require('koa-session')
const config = require('config')
const authRoutes = require('./routes/auth')
const reportRoutes = require('./routes/report')
const requireLogin = require('./auth/login')
const serve = require('koa-static')

const app = new Koa()
app.use(serve('./www'))

app.keys = [process.env.FORGE_CLIENT_ID || config.get('oauth2.clientID')]
app.use(cors({ credentials: true }))
app.use(favicon(path.join(__dirname, config.get('favicon'))))
app.use(helmet())
app.use(bodyParser())
app.use(morgan('combined'))
app.use(session({ beforeSave: (ctx, sess) => {
  ctx.session.cookie = sess.cookie = config.get('session')
}
}, app))

// Authentication
require('./auth')
app.use(passport.initialize())
app.use(passport.session())

// Add routing
app.use(authRoutes.routes())
app.use(authRoutes.allowedMethods())
app.use(requireLogin)
app.use(reportRoutes.routes())
app.use(reportRoutes.allowedMethods())
const port = process.env.PORT || config.get('http_port')
const server = app.listen(port, () => {
  console.info(`Server listening on port: ${port}.\n`)
  if(process.argv[2]==='test') server.close()
})
