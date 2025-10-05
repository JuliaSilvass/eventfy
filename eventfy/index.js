const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const exphbs = require("express-handlebars");
const path = require("path");
require("dotenv").config();
const admin = require('firebase-admin');
const authRoutes = require('./routes/authRoutes');

const app = express();
//tem que gerar essa chave lá no firebase
//o caminho é: configurações > contas de serviço.
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Handlebars 
app.engine("hbs", exphbs.engine({ extname: "hbs", defaultLayout: "main" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//lógica para manter a sessão. ta no index, mas o ideal é que a gente modularize ela. fiquei com preguiça mals.
const checkAuth = async (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return next();
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.clearCookie('authToken');
    return next();
  }
};

// Rotas
app.get("/", (req, res) => {
  res.render("home");
});

app.use('/', authRoutes);

app.get("/cadastro", (req, res) => {
 res.render("auth/cadastro");
});

//app.post("/cadastro", (req, res) => {
//  console.log(req.body); 
//  res.send("Cadastro recebido!");
//});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.get("/dashboard", checkAuth, (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  res.render("dashboard", { user: req.user });
});

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});