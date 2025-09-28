const express = require("express");
const cors = require("cors");
const exphbs = require("express-handlebars");
const path = require("path");
require("dotenv").config();
const authRoutes = require('./routes/authRoutes');

const app = express();

// Handlebars 
app.engine("hbs", exphbs.engine({ extname: "hbs", defaultLayout: "main" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

// Rotas
app.get("/", (req, res) => {
  res.send("Fazer a tela inicial do app né, esqueci asuhshauhuasshuuh");
});

app.use('/', authRoutes);

app.get("/cadastro", (req, res) => {
  res.render("auth/cadastro");
});

app.post("/cadastro", (req, res) => {
  console.log(req.body); 
  res.send("Cadastro recebido!");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});


app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});