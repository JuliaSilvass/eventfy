const { db, admin } = require('../firebaseAdmin');
const multer = require("multer");

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

    // salva na collection "imagens"
    const docRef = db.collection("imagens").doc(req.user.uid);
    await docRef.set({
      foto: base64,
      contentType,
      updatedAt: new Date()
    });

    // cria URL para exibir no front
    const photoURL = `data:${contentType};base64,${base64}`;

    // atualiza o campo do usuário
    await db.collection("usuarios").doc(req.user.uid).update({ photoURL });
    

    return res.redirect("/perfil");
  } catch (error) {
    
    return res.redirect("/perfil?erroUpload=true");
  }
};


exports.listarEmpresas = async (req, res) => {
  if (!req.user) return res.redirect('/login');

  try {
    const querySnapshot = await db.collection('usuarios')
      .where('tipo', '==', 'fornecedor')
      .get();

    const empresas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.render('empresas/listarEmpresas', {
      empresas,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.render('empresas/listarEmpresas', {
      empresas: [],
      user: req.user,
      erro: "Erro ao carregar empresas."
    });
  }
};

exports.buscarEmpresas = async (req, res) => {
  const termo = req.query.q ? req.query.q.toLowerCase() : "";

  try {
    const querySnapshot = await db.collection('usuarios')
      .where('tipo', '==', 'fornecedor')
      .get();

    let empresas = querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    if (termo) {
      empresas = empresas.filter(e =>
        e.nome && e.nome.toLowerCase().includes(termo)
      );
    }

    res.json(empresas);
  } catch (error) {
    console.error("Erro na busca:", error);
    res.status(500).json({ erro: "Erro ao buscar empresas" });
  }
};

exports.toggleFavorito = async (req, res) => {
  if (!req.user || req.user.tipo !== 'organizador') {
    return res.status(403).json({ erro: 'Ação não permitida' });
  }

  const { fornecedorId, nomeEmpresa } = req.body;
  const organizadorId = req.user.uid;

  if (!fornecedorId) {
    return res.status(400).json({ erro: 'ID do fornecedor é obrigatório' });
  }

  try {
    const favoritoRef = db.collection('usuarios').doc(organizadorId)
      .collection('favoritos').doc(fornecedorId);

    const fornecedorRef = db.collection('usuarios').doc(fornecedorId);

    await db.runTransaction(async (transaction) => {
      const favoritoDoc = await transaction.get(favoritoRef);

      if (favoritoDoc.exists) {
        transaction.delete(favoritoRef);
        transaction.update(fornecedorRef, {
          favoritosCount: admin.firestore.FieldValue.increment(-1)
        });
      } else {
        transaction.set(favoritoRef, {
          nome: nomeEmpresa,
          adicionadoEm: admin.firestore.FieldValue.serverTimestamp()
        });
        transaction.update(fornecedorRef, {
          favoritosCount: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
      }
    });

    res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao favoritar:', error);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
};
