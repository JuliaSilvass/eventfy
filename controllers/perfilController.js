const admin = require("firebase-admin");
const db = admin.firestore()
const multer = require("multer");
const path = require("path");


// ---------------- CONFIGURAÇÃO DO MULTER ---------------- //// multer config (ajuste se já tiver)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB máximo para Firestore
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Tipo de arquivo inválido"));
    cb(null, true);
  }
});

exports.uploadMiddleware = upload.single("fotoPerfil");

exports.uploadFotoPerfil = async (req, res) => {
  try {
   

    if (!req.user || !req.user.uid) {
   
      return res.redirect("/login");
    }
   

    if (!req.file) {
      
      return res.redirect("/perfil?erro=semArquivo");
    }

    // converte buffer para base64
    const base64 = req.file.buffer.toString("base64");
    const contentType = req.file.mimetype;

    // salva no Firestore na collection "imagens"
    const docRef = db.collection("imagens").doc(req.user.uid);
    await docRef.set({
      foto: base64,
      contentType,
      updatedAt: new Date()
    });

    // cria URL para exibir no front (data URL)
    const photoURL = `data:${contentType};base64,${base64}`;

    // atualiza campo do usuário
    await db.collection("usuarios").doc(req.user.uid).update({ photoURL });
    

    return res.redirect("/perfil");
  } catch (error) {
   
    return res.redirect("/perfil?erroUpload=true");
  }
};

// export para o route
exports.uploadMiddleware = upload.single("fotoPerfil");


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

    const userRef = db.collection("usuarios").doc(uid);

    // ==============================
    // BUSCA EVENTOS
    // ==============================
    const eventosSnapshot = await userRef.collection("eventos").get();

    const eventos = eventosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // QUANTIDADE DE EVENTOS FINALIZADOS
    let eventosFinalizados = 0;

    for (const evt of eventos) {
      if (evt.status === "finalizado") {
        eventosFinalizados++;
      }
    }

    // ==============================
    // CONTAR AVALIAÇÕES FEITAS
    // ==============================
    let totalAvaliacoesFeitas = 0;

    for (const evt of eventos) {
      const servicosSnap = await userRef
        .collection("eventos")
        .doc(evt.id)
        .collection("meus_servicos")
        .get();

      servicosSnap.forEach((servico) => {
        const s = servico.data();
        if (s.avaliacao) totalAvaliacoesFeitas++;
      });
    }

    // ==============================
    // FAVORITOS (DEIXEI COMO ESTAVA)
    // ==============================
    const favoritosSnapshot = await userRef
      .collection("favoritos")
      .orderBy("adicionadoEm", "desc")
      .get();

    const favoritos = favoritosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // ==============================
    // RENDERIZA
    // ==============================
    res.render("perfis/perfilOrganizador", {
      usuario: req.user,
      eventos,
      favoritos,
      eventosRealizados: eventosFinalizados,
      avaliacaoOrganizador: totalAvaliacoesFeitas,
      isOwner: true,
      visitante: req.user
    });

  } catch (err) {
    console.error("Erro ao carregar dados do organizador:", err);
    res.render("perfis/perfilOrganizador", {
      usuario: req.user,
      eventos: [],
      favoritos: [],
      eventosRealizados: 0,
      avaliacaoOrganizador: 0,
      erro: "Erro ao carregar dados",
      isOwner: true,
      visitante: req.user
    });
  }
};


exports.getPerfilFornecedor = async (req, res) => {
  try {
    const uid = req.user.uid;

    // Buscar serviços criados pelo fornecedor
    const servicosSnapshot = await db.collection("servicos")
      .where("prestadorID", "==", uid)
      .get();

    const servicos = servicosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // ====== CONTAR SERVIÇOS PRESTADOS E AVALIAÇÕES ======
    let totalAvaliacoes = 0;
    let eventosFinalizadosUsados = new Set();

    // Buscar todos usuários
    const usuariosSnapshot = await db.collection("usuarios").get();

    for (const usuarioDoc of usuariosSnapshot.docs) {
      const eventosSnapshot = await usuarioDoc.ref.collection("eventos").get();

      for (const eventoDoc of eventosSnapshot.docs) {
        const evento = eventoDoc.data();

        const fimEvento = new Date(`${evento.dataFim}T${evento.horarioFim}`);
        const finalizado = new Date() > fimEvento;

        const servicosUsados = await eventoDoc.ref.collection("meus_servicos").get();

        for (const serv of servicosUsados.docs) {
          const s = serv.data();

          // Se este serviço pertence ao fornecedor
          if (s.prestadorID === uid) {

            if (finalizado) {
              eventosFinalizadosUsados.add(eventoDoc.id);
            }

            if (s.avaliacao) {
              totalAvaliacoes++;
            }
          }
        }
      }
    }

    res.render("perfis/perfilFornecedor", {
      usuario: { id: uid, ...req.user },   
      servicos,
      fotos: [],
      isOwner: true,
      visitante: req.user,
      servicosPrestados: eventosFinalizadosUsados.size,
      avaliacaoFornecedor: totalAvaliacoes
    });


  } catch (err) {
    console.error("Erro ao carregar perfil fornecedor:", err);
    res.render("perfis/perfilFornecedor", {
      usuario: req.user,
      servicos: [],
      fotos: [],
      isOwner: true,
      visitante: req.user,
      servicosPrestados: 0,
      avaliacaoFornecedor: 0,
      erro: "Erro ao carregar dados"
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

    // ============================
    // ➤ CÁLCULOS QUE ESTAVAM FALTANDO
    // ============================
    let totalAvaliacoes = 0;
    let eventosFinalizadosUsados = new Set();

    const usuariosSnapshot = await db.collection("usuarios").get();

    for (const usuarioDoc of usuariosSnapshot.docs) {
      const eventosSnapshot = await usuarioDoc.ref.collection("eventos").get();

      for (const eventoDoc of eventosSnapshot.docs) {
        const evento = eventoDoc.data();

        const fimEvento = new Date(`${evento.dataFim}T${evento.horarioFim}`);
        const finalizado = new Date() > fimEvento;

        const servicosUsados = await eventoDoc.ref.collection("meus_servicos").get();

        for (const serv of servicosUsados.docs) {
          const s = serv.data();

          if (s.prestadorID === fornecedorId) {

            if (finalizado) {
              eventosFinalizadosUsados.add(eventoDoc.id);
            }

            if (s.avaliacao) {
              totalAvaliacoes++;
            }
          }
        }
      }
    }
    // ============================

    res.render("perfis/perfilFornecedor", {
      usuario: fornecedorData, 
      servicos,
      fotos: fotosPortfolio,
      isOwner: isOwner,
      visitante: req.user,
      isFavorito: isFavorito,

      // ➤ agora funciona para visitantes também
      servicosPrestados: eventosFinalizadosUsados.size,
      avaliacaoFornecedor: totalAvaliacoes
    });

  } catch (err) {
    console.error("Erro ao carregar perfil público do fornecedor:", err);
    res.status(500).send("Erro ao carregar página.");
  }
};



exports.getAvaliacoesFornecedor = async (req, res) => {
  try {
    const fornecedorId = req.params.id;

    // VERIFICA SE O FORNECEDOR EXISTE
    const fornecedorDoc = await db.collection("usuarios").doc(fornecedorId).get();
    if (!fornecedorDoc.exists || fornecedorDoc.data().tipo !== "fornecedor") {
      return res.status(404).send("Fornecedor não encontrado");
    }

    const fornecedor = { id: fornecedorDoc.id, ...fornecedorDoc.data() };

    let avaliacoes = [];

    // BUSCA EM TODOS OS USUÁRIOS -> EVENTOS -> MEUS_SERVICOS
    const usuariosSnap = await db.collection("usuarios").get();

    for (const user of usuariosSnap.docs) {
      const eventosSnap = await user.ref.collection("eventos").get();

      for (const evento of eventosSnap.docs) {
        const servicosSnap = await evento.ref.collection("meus_servicos").get();

        servicosSnap.forEach(serv => {
          const s = serv.data();

          if (s.prestadorID === fornecedorId && s.avaliacao) {
            avaliacoes.push({
              nota: s.avaliacao.nota,
              comentario: s.avaliacao.comentario,
              data: s.avaliacao.data.toDate().toLocaleString("pt-BR"),
              servico: s.nome,
              organizador: user.data().nome || "Organizador"
            });
          }
        });
      }
    }

    res.render("perfis/avaliacoesFornecedor", {
      fornecedor,
      avaliacoes,
      visitante: req.user
    });

  } catch (err) {
    console.error("Erro ao listar avaliações:", err);
    res.status(500).send("Erro interno");
  }
};
