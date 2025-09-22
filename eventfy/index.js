const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.use('/', authRoutes);

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});