const admin = require("firebase-admin");

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
    const db = admin.firestore();

    const eventosSnapshot = await db
      .collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos") // Busca eventos do organizador
      .get();

    const eventos = eventosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("perfis/perfilOrganizador", {
      usuario: req.user,
      eventos,
    });
  } catch (err) {
    console.error("Erro ao carregar eventos:", err);
    res.render("perfis/perfilOrganizador", {
      usuario: req.user,
      eventos: [],
      erro: "Erro ao carregar eventos",
    });
  }
};

exports.getPerfilFornecedor = async (req, res) => {
  try {
    const db = admin.firestore();
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
    });

  } catch (err) {
    console.error("Erro ao carregar perfil do fornecedor:", err);
    res.render("perfis/perfilFornecedor", {
      usuario: req.user,
      servicos: [],
      fotos: [],
      erro: "Erro ao carregar dados do perfil",
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
    const db = admin.firestore();
    const auth = admin.auth();
    const firestoreUpdates = {
      nome: nome,
      email: email,
      telefone: telefone.replace(/\D/g, "")
    };

    if (req.body.sobreNos) {
      firestoreUpdates.sobreNos = req.body.sobreNos;
    }

    if (email !== req.user.email) {
      await auth.updateUser(uid, {
        email: email
      });
    }
    const userRef = db.collection("usuarios").doc(uid);
    await userRef.update(firestoreUpdates);
    res.redirect("/perfil");
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.render("perfis/editarPerfil", {
      usuario: req.body,
      erro: "Não foi possível atualizar o perfil. Tente novamente."
    });
  }
};

exports.updatePerfil = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { nome, email, telefone } = req.body;
  const { uid } = req.user;

  try {
    const db = admin.firestore();
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
    const db = admin.firestore();
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