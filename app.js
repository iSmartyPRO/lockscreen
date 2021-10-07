const express = require("express")
const morgan = require("morgan")

const app = express()
const pagesRoutes = require("./routes/pages")

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('combined'))
app.use("/", pagesRoutes)

module.exports = app