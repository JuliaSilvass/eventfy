const { db } = require("../firebase");
const { doc, getDoc } = require("firebase/firestore");

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