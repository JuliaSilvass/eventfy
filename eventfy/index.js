const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const exphbs = require("express-handlebars");
const path = require("path");
require("dotenv").config();
const admin = require('firebase-admin');

const authRoutes = require('./routes/authRoutes');
const servicoRoutes = require('./routes/servicoRoutes');


const app = express();
//tem que gerar essa chave lá no firebase
//o caminho é: configurações > contas de serviço.
//se precisar de ajuda pra fazer essa merda funcionar, chama no led zeppelin
const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error("❌ Erro ao carregar credenciais do Firebase Admin:", err.message);
}


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();


// Handlebars 
const hbs = exphbs.create({
  extname: "hbs",
  defaultLayout: "main",
  helpers: {
    eq: (a, b) => a === b,
  }
});
app.engine("hbs", hbs.engine);
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
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDocSnap = await db.collection("usuarios").doc(uid).get();

    if (!userDocSnap.exists) {
      res.clearCookie("authToken");
      req.user = null;
      return next();
    }

    req.user = {
      uid,
      email: decodedToken.email,
      ...userDocSnap.data(),
    };

    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error.message);
    res.clearCookie("authToken");
    req.user = null;
    next();
  }
};

// Rotas
app.get("/", checkAuth, (req, res) => {
  res.render("home", { user: req.user });
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

app.get("/dashboard", checkAuth, (req, res) => {
  console.log("Usuário autenticado:", req.user);
  if (!req.user) {
    return res.redirect('/login');
  }
  res.render("dashboard", { user: req.user });
});

app.use('/servicos', checkAuth, servicoRoutes);

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});