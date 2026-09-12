const express = require('express')
require("dotenv").config();
const app = express()
const port = process.env.port
const cors = require('cors')



app.use(express.json(), express.urlencoded({ extended: true }),cors())


  require("./config/mongoose.config");
  require("./routes/collection.routes")(app);


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })