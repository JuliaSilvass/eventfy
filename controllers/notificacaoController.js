const admin = require("firebase-admin");
const db = admin.firestore();

exports.obterNotificacoes = async (req, res) => {
  if (!req.user) return res.status(401).send("Não autorizado");

  try {
    const uid = req.user.uid;

    const snapshot = await db.collection("usuarios")
      .doc(uid)
      .collection("notificacoes")
      .orderBy("criadoEm", "desc")
      .limit(10)
      .get();

    const notificacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dataFormatada: doc.data().criadoEm ? new Date(doc.data().criadoEm.toDate()).toLocaleDateString('pt-BR') : ""
    }));

    res.render("notificacoes/listar", {
      layout: false,
      notificacoes
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("<div class='notification-empty'>Erro ao carregar.</div>");
  }
};

exports.marcarComoLida = async (req, res) => {
  if (!req.user) return res.status(401).json({ erro: "Não autorizado" });
  try {
    const { id } = req.params;
    await db.collection("usuarios").doc(req.user.uid)
      .collection("notificacoes").doc(id).update({ lida: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ erro: "Erro ao atualizar" });
  }
};