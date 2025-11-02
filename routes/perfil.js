const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    // Buscar eventos criados pelo usuário
    const eventosSnap = await db
      .collection("eventos")
      .where("userId", "==", req.user.uid)
      .get();

    const eventos = eventosSnap.docs.map(doc => doc.data());

    res.render("perfil_organizador/perfil", {
      user: req.user,
      eventos
    });
  } catch (err) {
    console.error("Erro ao carregar perfil:", err.message);
    res.status(500).send("Erro ao carregar perfil.");
  }
});

module.exports = router;
