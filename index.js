const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const exphbs = require("express-handlebars");
const path = require("path");
require("dotenv").config();
const admin = require("firebase-admin");

const authRoutes = require("./routes/authRoutes");
const servicoRoutes = require("./routes/servicoRoutes");
const eventoRoutes = require("./routes/eventoRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
// --- NOVO ---
const empresaRoutes = require("./routes/empresaRoutes");

const app = express();

const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error("Erro ao carregar credenciais do Firebase Admin:", err.message);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

const hbs = exphbs.create({
  extname: "hbs",
  defaultLayout: "main",
  helpers: {
    eq: (a, b) => a === b,
  },
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

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

    req.user = { uid, email: decodedToken.email, ...userDocSnap.data() };
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error.message);
    res.clearCookie("authToken");
    req.user = null;
    next();
  }
};

app.get("/", checkAuth, (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/dashboard", checkAuth, (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("dashboard", { user: req.user });
});

app.get("/cadastro", (req, res) => res.render("auth/cadastro", { layout: "main_deslogado" }));
app.get("/login", (req, res) => res.render("auth/login", { layout: "main_deslogado" }));

app.use("/", authRoutes);
app.use("/servicos", checkAuth, servicoRoutes);
app.use("/eventos", checkAuth, eventoRoutes);
app.use("/perfil", checkAuth, perfilRoutes);
app.use("/empresas", checkAuth, empresaRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get(
  "/fornecedor/:id",
  checkAuth,
  require("./controllers/perfilController").getFornecedorPublico
);

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});

