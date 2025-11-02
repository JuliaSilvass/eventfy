const admin = require("firebase-admin");

exports.getPerfilOrganizador = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  try {
    const db = admin.firestore();

    const eventosSnapshot = await db
      .collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos")
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
