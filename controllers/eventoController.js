const admin = require("firebase-admin");
const db = admin.firestore();


exports.getNovoEvento = (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("eventos/novoEvento", { user: req.user });
};

exports.createNovoEvento = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, horarioInicio, horarioFim, icone, descricao } = req.body;

    if (!req.user) return res.redirect("/login");

    const eventoData = {
      nome,
      dataInicio,
      dataFim,
      horarioInicio,
      horarioFim,
      icone,
      descricao,
      criadoEm: new Date(),
      userId: req.user.uid,
    };

    const db = admin.firestore();
    await db
      .collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos")
      .add(eventoData);

    console.log("Evento criado:", eventoData);
    res.redirect("/perfil");
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).send("Erro ao criar evento");
  }
};

exports.visualizarEvento = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { id } = req.params;
    console.log("ID recebido da URL:", id);
    console.log("UID do usuário logado:", req.user.uid);
    const db = admin.firestore();

    const eventoRef = db
      .collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos")
      .doc(id);

    const eventoDoc = await eventoRef.get();
     console.log("Evento encontrado?", eventoDoc.exists);

    if (!eventoDoc.exists) {
      return res.status(404).send("Evento não encontrado");
    }

    const evento = eventoDoc.data();

    const servicos = [
      { nome: "Serviço", descricao: "DESCRIÇÃO", preco: "00,00" },
      { nome: "Serviço", descricao: "DESCRIÇÃO", preco: "00,00" },
      { nome: "Serviço", descricao: "DESCRIÇÃO", preco: "00,00" },
      { nome: "Serviço", descricao: "DESCRIÇÃO", preco: "00,00" },
    ];

    res.render("eventos/visualizarEvento", {
      user: req.user,
      nomeEvento: evento.nome,
      servicos,
      total: "00,00",
    });
  } catch (error) {
    console.error("Erro ao visualizar evento:", error);
    res.status(500).send("Erro ao carregar o evento");
  }
};


exports.listarEventos = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  try {
    const db = admin.firestore();
    
    const snapshot = await db
      .collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos")
      .get();

    const eventos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.render("eventos/listarEventos", { user: req.user, eventos });
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    res.status(500).send("Erro ao carregar eventos");
  }
};


exports.getEditarEvento = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const ref = db
    .collection("usuarios")
    .doc(req.user.uid)
    .collection("eventos")
    .doc(req.params.id);

  const doc = await ref.get();

  if (!doc.exists) return res.status(404).send("Evento não encontrado");

  res.render("eventos/editarEvento", { user: req.user, evento: { id: doc.id, ...doc.data() } });
};

exports.editarEventoPost = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  await db
    .collection("usuarios")
    .doc(req.user.uid)
    .collection("eventos")
    .doc(req.params.id)
    .update({
      nome: req.body.nome,
      dataInicio: req.body.dataInicio,
      dataFim: req.body.dataFim,
      horarioInicio: req.body.horarioInicio,
      horarioFim: req.body.horarioFim,
      icone: req.body.icone,
      descricao: req.body.descricao
    });

  res.redirect("/eventos");
};


exports.excluirEvento = async (req, res) => {
  if (!req.user) return res.status(401).send("Não autorizado");

  await db
    .collection("usuarios")
    .doc(req.user.uid)
    .collection("eventos")
    .doc(req.params.id)
    .delete();

  res.status(200).send("OK");
};
