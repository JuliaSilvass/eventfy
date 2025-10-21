const { db } = require('../firebaseAdmin'); // usando Admin SDK
const { FieldValue } = require('firebase-admin/firestore');

exports.getServicoForm = async (req, res) => {
  if (!req.user) return res.redirect('/login');

  try {
    const userDoc = await db.collection('usuarios').doc(req.user.uid).get();

    if (!userDoc.exists) return res.status(404).send('Usuário não encontrado.');

    const userData = userDoc.data();
    const user = { ...req.user, tipo: userData.tipo };

    res.render('servicos/cadastrarServico', { user });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.redirect('/dashboard');
  }
};

exports.createServicoPost = async (req, res) => {
  if (!req.user) return res.redirect('/login');

  try {
    const { nomeServico, categoria, preco, descricao, disponibilidade } = req.body;

    const novoServico = {
      nome: nomeServico,
      categoria,
      preco: Number(preco),
      descricao,
      prestadorID: req.user.uid,
      disponibilidade: JSON.parse(disponibilidade || '{}'),
      imagens: req.files?.map(f => f.originalname) || [],
      criadoEm: FieldValue.serverTimestamp()
    };

    await db.collection('servicos').add(novoServico);

    console.log('Serviço cadastrado com sucesso!');
    res.redirect('/servicos');
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    res.status(500).send('Ocorreu um erro ao salvar o serviço.');
  }
};

exports.listarServicos = async (req, res) => {
  if (!req.user) return res.redirect('/login');

  try {
    const querySnapshot = await db.collection('servicos')
      .orderBy('criadoEm', 'desc')
      .get();

    const servicos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.render('servicos/listarServicos', { servicos });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.render('servicos/listarServicos', { servicos: [] });
  }
};


exports.apagarServico = async (req, res) => {
  if (!req.user) {
    return res.status(401).send('Não autorizado');
  }

  const { id } = req.params;

  try {
    const servicoRef = db.collection('servicos').doc(id);
    const servicoDoc = await servicoRef.get();

    if (!servicoDoc.exists) {
      return res.status(404).send('Serviço não encontrado');
    }

    // Só permitir que o dono apague
    if (servicoDoc.data().prestadorID !== req.user.uid) {
      return res.status(403).send('Você não pode apagar este serviço');
    }

    await servicoRef.delete();
    return res.status(200).send('Serviço apagado com sucesso');

  } catch (error) {
    console.error('Erro ao apagar serviço:', error);
    return res.status(500).send('Erro ao apagar serviço');
  }
};
