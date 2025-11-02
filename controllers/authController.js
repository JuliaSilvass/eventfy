const { auth, db } = require("../firebase");
const { doc, setDoc, getDoc } = require("firebase/firestore");
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
    // Podemos adicionar uma tradução de erros aqui também no futuro
    res.status(400).json({ erro: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;
    const token = await userCredential.user.getIdToken();

    //Busca dados do usuário no Firestore
    const userDocRef = doc(db, "usuarios", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const userData = userDocSnap.data();

    res.cookie('authToken', token, {
    httpOnly: true, 
    secure: false,
    maxAge: 3 * 24 * 60 * 60 * 1000 // Validade de 3 dias
    });

    res.status(200).json({
      message: "Login realizado com sucesso",
      user: {
        uid,
        email: userData.email,
        tipo: userData.tipo,
        nome: userData.nome
      }})
    
  } 
  catch (error) {
    let mensagemErro = "Email ou senha inválidos.";
    res.status(400).json({ erro: mensagemErro });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ message: "Logout realizado com sucesso" });
};