const admin = require("firebase-admin");

exports.checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) return res.redirect("/login");

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error);
    return res.redirect("/login");
  }
};
