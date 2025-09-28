const { auth, db } = require("../firebase");
const { doc, setDoc } = require("firebase/firestore");
const { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} = require("firebase/auth");

exports.register = async (req, res) => {
  const { email, senha, nome, tipo, telefone, cpf, cnpj, dataNasc } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;
    const userDocRef = doc(db, "usuarios", uid);

    // Monta objeto dinâmico
    const dadosUsuario = {  
      nome,
      email,
      tipo,
      telefone,
      dataCadastro: new Date()
    };

    if (tipo === "organizador") {
      dadosUsuario.cpf = cpf;
      dadosUsuario.dataNasc = dataNasc;
    } else if (tipo === "fornecedor") {
      dadosUsuario.cnpj = cnpj;
    }

    await setDoc(userDocRef, dadosUsuario);

    res.status(201).json({ uid, email });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const token = await userCredential.user.getIdToken();
    res.json({ token });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};