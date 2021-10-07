const express = require("express")
const router = express.Router()
const controller = require("../controllers/pages")

router.get('/', controller.home)
router.get('/script', controller.script)
router.get('/scriptPowershell', controller.scriptPowershell)

module.exports = router