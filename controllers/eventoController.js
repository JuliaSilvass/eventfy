const admin = require("firebase-admin");

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
