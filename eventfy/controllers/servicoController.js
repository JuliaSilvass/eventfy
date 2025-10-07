const { db } = require("../firebase");
const { doc, getDoc, serverTimestamp, collection, addDoc } = require("firebase/firestore");

exports.getServicoForm = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const userDocRef = doc(db, "usuarios", req.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
       return res.status(404).send("Usuário não encontrado no banco de dados.");
    }
    
    const userData = userDoc.data();
    const user = { ...req.user, tipo: userData.tipo };

    res.render("servicos/cadastrarServico", { user });

  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    res.redirect("/dashboard");
  }
};


exports.createServicoPost = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const {nomeServico, categoria, preco, descricao} = req.body;

    console.log("Arquivos recebidos:", req.files);
  

  const novoServico = {
    nome: nomeServico,
    categoria: categoria,
    preco: Number(preco),
    descricao: descricao,
    pretadorID: req.user.uid,
    criadoEm: serverTimestamp(),
  };


  const servicosCollectionRef = collection(db, "servicos");
  await addDoc(servicosCollectionRef, novoServico);

  console.log("Serviço cadastrado com sucesso!");

  res.redirect("/dashboard");

} catch (error){
  console.error("Erro ao cadastrar serviço:", error);
    res.status(500).send("Ocorreu um erro ao salvar o serviço.");
  }
};