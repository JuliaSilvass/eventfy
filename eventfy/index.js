const express = require("express");
const cors = require("cors");
const { auth, db } = require("./firebase");
const { doc, setDoc } = require("firebase/firestore");
const { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} = require("firebase/auth");   
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.post("/register", async (req, res) => {
  const { email, senha, nome, tipo } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;

    const userDocRef = doc(db, "usuarios", uid);
    

    await setDoc(userDocRef, {
      nome,
      email,
      tipo,
      dataCadastro: new Date()
    });

    res.status(201).json({ uid, email });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const token = await userCredential.user.getIdToken();
    res.json({ token });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});