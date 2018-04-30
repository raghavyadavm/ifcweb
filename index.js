const express = require('express')
const app = express()
const path = require('path')
const serveStatic = require('serve-static')

app.use(serveStatic(path.resolve(__dirname, 'public')))

app.listen(3000, () => console.log('listening on port 3000!'))