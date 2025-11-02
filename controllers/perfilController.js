const admin = require("firebase-admin");
const { db } = require('../firebaseAdmin');

exports.getMeuPerfil = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const tipoUsuario = req.user.tipo;

  if (tipoUsuario === "organizador") {
    exports.getPerfilOrganizador(req, res);
  } else if (tipoUsuario === "fornecedor") {
    exports.getPerfilFornecedor(req, res);
  } else {
    res.redirect("/dashboard");
  }
};

exports.getPerfilOrganizador = async (req, res) => {
  try {
    const uid = req.user.uid;

    const eventosSnapshot = await db
      .collection("usuarios")
      .doc(uid)
      .collection("eventos")
      .get();
    const eventos = eventosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const favoritosSnapshot = await db
      .collection("usuarios")
      .doc(uid)
      .collection("favoritos")
      .orderBy("adicionadoEm", "desc")
      .get();
    const favoritos = favoritosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("perfis/perfilOrganizador", {
      usuario: req.user,
      eventos,
      favoritos: favoritos, 
      isOwner: true,
      visitante: req.user
    });
  } catch (err) {
    console.error("Erro ao carregar dados do organizador:", err);
    res.render("perfis/perfilOrganizador", {
      usuario: req.user,
      eventos: [],
      favoritos: [],
      erro: "Erro ao carregar dados",
      isOwner: true,
      visitante: req.user
    });
  }
};

exports.getPerfilFornecedor = async (req, res) => {
  try {
    const uid = req.user.uid;

    const servicosSnapshot = await db.collection('servicos')
      .where('prestadorID', '==', uid)
      .orderBy('criadoEm', 'desc')
      .get();

    const servicos = servicosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const fotosPortfolio = []; 

    res.render("perfis/perfilFornecedor", {
      usuario: req.user, 
      servicos: servicos,
      fotos: fotosPortfolio,
      isOwner: true,
      visitante: req.user
    });

  } catch (err) {
    console.error("Erro ao carregar perfil do fornecedor:", err);
    res.render("perfis/perfilFornecedor", {
      usuario: req.user,
      servicos: [],
      fotos: [],
      erro: "Erro ao carregar dados do perfil",
      isOwner: true,
      visitante: req.user
    });
  }
};


exports.getEditarPerfilForm = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("perfis/editarPerfil", {
    usuario: req.user
  });
};

exports.updatePerfil = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { nome, email, telefone } = req.body;
  const { uid } = req.user;

  try {
    const auth = admin.auth();

    const firestoreUpdates = {
      nome: nome,
      email: email, 
      telefone: telefone.replace(/\D/g, "") 
    };

    if (req.body.sobreNos !== undefined) {
      firestoreUpdates.sobreNos = req.body.sobreNos;
    }

    if (email !== req.user.email) {
      await auth.updateUser(uid, {
        email: email
      });
    }

    const userRef = db.collection("usuarios").doc(uid);
    await userRef.update(firestoreUpdates);

    console.log("Perfil atualizado com sucesso para o UID:", uid);
    
    res.redirect("/perfil");

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    
    const reloadedUser = { ...req.user, ...req.body };
    
    res.render("perfis/editarPerfil", {
      usuario: reloadedUser, 
      erro: "Não foi possível atualizar o perfil. Tente novamente."
    });
  }
};

exports.updateDescricao = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const { sobreNos } = req.body;
  const { uid } = req.user;

  if (sobreNos === undefined) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  try {
    const userRef = db.collection("usuarios").doc(uid);

    await userRef.update({
      sobreNos: sobreNos
    });

    res.status(200).json({ 
      sucesso: true, 
      novaDescricao: sobreNos 
    });

  } catch (error) {
    console.error("Erro ao atualizar descrição:", error);
    res.status(500).json({ erro: "Erro interno ao salvar." });
  }
};

exports.getFornecedorPublico = async (req, res) => {
  if (!req.user) return res.redirect("/login"); 

  try {
    const fornecedorId = req.params.id; 
    const visitanteId = req.user.uid;    

    const isOwner = fornecedorId === visitanteId;

    const userDoc = await db.collection("usuarios").doc(fornecedorId).get();
    if (!userDoc.exists || userDoc.data().tipo !== "fornecedor") {
      return res.status(404).send("Fornecedor não encontrado.");
    }
    
    const fornecedorData = { id: userDoc.id, ...userDoc.data() };

    const servicosSnapshot = await db.collection('servicos')
      .where('prestadorID', '==', fornecedorId)
      .orderBy('criadoEm', 'desc')
      .get();
    const servicos = servicosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const fotosPortfolio = []; 

    let isFavorito = false;
    if (req.user.tipo === 'organizador' && !isOwner) {
      const favoritoDoc = await db.collection('usuarios').doc(visitanteId)
                                  .collection('favoritos').doc(fornecedorId).get();
      isFavorito = favoritoDoc.exists;
    }

    res.render("perfis/perfilFornecedor", {
      usuario: fornecedorData, 
      servicos: servicos,
      fotos: fotosPortfolio,
      isOwner: isOwner,
      visitante: req.user,
      isFavorito: isFavorito
    });

  } catch (err) {
    console.error("Erro ao carregar perfil público do fornecedor:", err);
    res.status(500).send("Erro ao carregar página.");
  }
};