const admin = require("firebase-admin");
const db = admin.firestore();

const MAPA_CATEGORIAS = {
  'fotografia': 'Fotografia e Vídeo',
  'buffet': 'Buffet e Alimentação',
  'decoracao': 'Decoração',
  'musica': 'Música e Entretenimento',
  'local': 'Local e Espaço',
  'outro': 'Outros Serviços'
};

exports.getNovoEvento = (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("eventos/novoEvento", { user: req.user });
};

exports.createNovoEvento = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, horarioInicio, horarioFim, icone, descricao } = req.body;

    if (!req.user) return res.redirect("/login");

    let erro = null;

    const nomeLimpo = nome ? nome.trim() : "";
    const descricaoLimpa = descricao ? descricao.trim() : "";

    if (!nomeLimpo) erros.nome = "O nome é obrigatório.";
    if (!dataInicio) erros.dataInicio = "Data obrigatória.";
    if (!dataFim) erros.dataFim = "Data obrigatória.";
    if (!horarioInicio) erros.horarioInicio = "Horário obrigatório.";
    if (!horarioFim) erros.horarioFim = "Horário obrigatório.";

    if (nomeLimpo && nomeLimpo.length < 3) {
      erros.nome = "Mínimo de 3 caracteres.";
    } 
    if (nomeLimpo && nomeLimpo.length > 100) {
      erros.nome = "Máximo de 100 caracteres.";
    }
    if (descricaoLimpa && descricaoLimpa.length > 1000) {
      erros.descricao = "Máximo de 1000 caracteres.";
    }

    if (dataInicio && horarioInicio && dataFim && horarioFim) {
      const inicio = new Date(`${dataInicio}T${horarioInicio}`);
      const fim = new Date(`${dataFim}T${horarioFim}`);
      const agora = new Date();

      if (isNaN(inicio.getTime())) {
        erros.dataInicio = "Data inválida.";
      } else if (isNaN(fim.getTime())) {
        erros.dataFim = "Data inválida.";
      } else {
        if (inicio < agora) {
          erros.dataInicio = "A data não pode ser no passado.";
        }
        
        if (fim <= inicio) {
          erros.dataFim = "A data final deve ser posterior ao início.";
          erros.horarioFim = "Verifique o horário.";
        }
      }
    }

    if (erro) {
      return res.render("eventos/novoEvento", { 
        user: req.user, 
        erro, 
        evento: req.body 
      });
    }

    const eventoData = {
      nome: nomeLimpo,
      dataInicio,
      dataFim,
      horarioInicio,
      horarioFim,
      icone,
      descricao: descricaoLimpa,
      criadoEm: new Date(),
      userId: req.user.uid,
      status: "planejado",
    };

    const docRef = await db.collection("usuarios").doc(req.user.uid).collection("eventos").add(eventoData);
    
    res.redirect(`/eventos/${docRef.id}/adicionar-servicos`);

  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).render("eventos/novoEvento", { 
      user: req.user, 
      erros: { geral: "Erro interno ao criar evento." },
      evento: req.body 
    });
  }
};

exports.getAdicionarServicos = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const eventoId = req.params.id;

  try {
    const eventoRef = db.collection("usuarios").doc(req.user.uid).collection("eventos").doc(eventoId);
    const eventoDoc = await eventoRef.get();
    if (!eventoDoc.exists) return res.redirect("/eventos");

    const selecionadosSnap = await eventoRef.collection("meus_servicos").get();
    const selecionados = selecionadosSnap.docs.map(d => ({ idVinculo: d.id, ...d.data() }));
    const idsSelecionados = new Set(selecionados.map(s => s.servicoOriginalId));

    const servicosSnap = await db.collection("servicos").get();
    const todosServicos = servicosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const prestadoresIds = new Set(todosServicos.map(s => s.prestadorID).filter(Boolean));
    const nomesEmpresas = {};
    await Promise.all([...prestadoresIds].map(async (uid) => {
      const userDoc = await db.collection("usuarios").doc(uid).get();
      if (userDoc.exists) {
        nomesEmpresas[uid] = userDoc.data().nome || "Empresa";
      }
    }));

    const categoriasObj = {};
    Object.keys(MAPA_CATEGORIAS).forEach(key => {
      categoriasObj[key] = {
        key: key,
        label: MAPA_CATEGORIAS[key],
        selecionado: null,
        disponiveis: []
      };
    });

    let total = 0;

    selecionados.forEach(serv => {
      total += (Number(serv.preco) || 0);
      if (categoriasObj[serv.categoria]) {
        serv.nomeEmpresa = nomesEmpresas[serv.prestadorID] || "Empresa";
        categoriasObj[serv.categoria].selecionado = serv;
      }
    });

    todosServicos.forEach(serv => {
      if (categoriasObj[serv.categoria] && !idsSelecionados.has(serv.id)) {
        serv.nomeEmpresa = nomesEmpresas[serv.prestadorID] || "Empresa";
        categoriasObj[serv.categoria].disponiveis.push(serv);
      }
    });

    res.render("eventos/selecionarServicos", { 
      user: req.user, 
      evento: { id: eventoId, ...eventoDoc.data() },
      categorias: Object.values(categoriasObj),
      sucesso: req.query.sucesso,
      total: total.toFixed(2)
    });

  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.redirect("/eventos");
  }
};

exports.postAdicionarServicoAoEvento = async (req, res) => {
  if (!req.user) return res.status(401).send("Não autorizado");
  const { idEvento, idServico } = req.params;

  try {
    const servicoOriginalDoc = await db.collection("servicos").doc(idServico).get();
    if (!servicoOriginalDoc.exists) return res.status(404).send("Serviço não encontrado");
    
    const dadosServico = servicoOriginalDoc.data();
    const categoriaDoServico = dadosServico.categoria;

    const meusServicosRef = db.collection("usuarios").doc(req.user.uid)
      .collection("eventos").doc(idEvento)
      .collection("meus_servicos");

    const querySnapshot = await meusServicosRef.where('categoria', '==', categoriaDoServico).get();
    if (!querySnapshot.empty) {
      const batch = db.batch();
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    let nomeEmpresa = "Fornecedor";
    if (dadosServico.prestadorID) {
      const userDoc = await db.collection("usuarios").doc(dadosServico.prestadorID).get();
      if (userDoc.exists) {
        nomeEmpresa = userDoc.data().nome || "Fornecedor";
      }
    }

    await meusServicosRef.add({
      ...dadosServico,
      nomeEmpresa,
      servicoOriginalId: idServico,
      adicionadoEm: new Date()
    });

    res.redirect(`/eventos/${idEvento}/adicionar-servicos?sucesso=true`);
  } catch (error) {
    console.error("Erro ao vincular:", error);
    res.status(500).send("Erro");
  }
};

exports.postRemoverServicoDoEvento = async (req, res) => {
  if (!req.user) return res.status(401).send("Não autorizado");
  const { idEvento, idServicoVinculado } = req.params;

  try {
    await db.collection("usuarios").doc(req.user.uid)
      .collection("eventos").doc(idEvento)
      .collection("meus_servicos").doc(idServicoVinculado).delete();

    res.redirect(`/eventos/${idEvento}/adicionar-servicos`);
  } catch (error) {
    console.error("Erro ao remover:", error);
    res.status(500).send("Erro");
  }
};

exports.cancelarCriacaoEvento = async (req, res) => {
  if (!req.user) return res.status(401).send("Não autorizado");
  const { id } = req.params;

  try {
    await db.collection("usuarios").doc(req.user.uid).collection("eventos").doc(id).delete();
    res.redirect("/perfil");
  } catch (error) {
    console.error("Erro ao cancelar evento:", error);
    res.status(500).send("Erro ao cancelar");
  }
};

exports.visualizarEvento = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    const { id } = req.params;

    const eventoRef = db.collection("usuarios").doc(req.user.uid).collection("eventos").doc(id);
    const eventoDoc = await eventoRef.get();
    if (!eventoDoc.exists) return res.status(404).send("Evento não encontrado");

    const evento = eventoDoc.data();

    const agora = new Date();
    const inicio = new Date(`${evento.dataInicio}T${evento.horarioInicio}`);
    const fim = new Date(`${evento.dataFim}T${evento.horarioFim}`);
    const eventoFinalizado = agora > fim;

    const servicosSnapshot = await eventoRef.collection("meus_servicos").get();
    
    let total = 0;
    const servicos = servicosSnapshot.docs.map(doc => {
      const data = doc.data();
      total += Number(data.preco) || 0;

      return {
        id: doc.id,
        ...data,
        temAvaliacao: !!data.avaliacao,
        categoriaLabel: MAPA_CATEGORIAS[data.categoria] || "Serviço"
      };
    });

    res.render("eventos/visualizarEvento", {
      user: req.user,
      eventoFinalizado,
      evento: { id: eventoDoc.id, ...evento },
      nomeEvento: evento.nome,
      servicos,
      total: total.toFixed(2)
    });

  } catch (error) {
    console.error("Erro ao visualizar:", error);
    res.status(500).send("Erro");
  }
};


exports.listarEventos = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  try {
    const snapshot = await db
      .collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos")
      .get();
    
    const agora = new Date();
    const batch = db.batch(); 

    const eventos = snapshot.docs.map(doc => {
      const data = doc.data();
      const id = doc.id;

      const dataInicioObj = new Date(`${data.dataInicio}T${data.horarioInicio}`);
      const dataFimObj = new Date(`${data.dataFim}T${data.horarioFim}`);

      // valores padrão
      let status = "planejado";
      let statusTexto = "Planejado";
      let statusClasse = "status-planejado";

      if (agora > dataFimObj) {
        status = "finalizado";
        statusTexto = "Finalizado";
        statusClasse = "status-finalizado";
      } else if (agora >= dataInicioObj && agora <= dataFimObj) {
        status = "andamento";
        statusTexto = "Em andamento";
        statusClasse = "status-andamento";
      }

      // Se o status no banco for diferente, atualiza
      if (data.status !== status) {
        batch.update(doc.ref, { status }); 
      }

      return { 
        id, 
        ...data,
        status,        
        statusTexto,
        statusClasse 
      };
    });

    // Efetiva as atualizações de status no banco
    await batch.commit(); 

    res.render("eventos/listarEventos", { user: req.user, eventos });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro");
  }
};



exports.getEditarEvento = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const ref = db.collection("usuarios").doc(req.user.uid).collection("eventos").doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).send("Evento não encontrado");
  res.render("eventos/editarEvento", { user: req.user, evento: { id: doc.id, ...doc.data() } });
};

exports.editarEventoPost = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  await db.collection("usuarios").doc(req.user.uid).collection("eventos").doc(req.params.id)
    .update({
      nome: req.body.nome, dataInicio: req.body.dataInicio, dataFim: req.body.dataFim,
      horarioInicio: req.body.horarioInicio, horarioFim: req.body.horarioFim,
      icone: req.body.icone, descricao: req.body.descricao
    });
  res.redirect("/eventos");
};

exports.excluirEvento = async (req, res) => {
  if (!req.user) return res.status(401).send("Não autorizado");
  await db.collection("usuarios").doc(req.user.uid).collection("eventos").doc(req.params.id).delete();
  res.status(200).send("OK");
};

exports.getAvaliacaoServico = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { idEvento, idServico } = req.params;

  try {
    const servicoRef = db.collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos")
      .doc(idEvento)
      .collection("meus_servicos")
      .doc(idServico);

    const servicoDoc = await servicoRef.get();
    if (!servicoDoc.exists) return res.status(404).send("Serviço não encontrado");

    const servico = servicoDoc.data();

    res.render("eventos/avaliarServico", {
      user: req.user,
      eventoId: idEvento,
      servicoId: idServico,
      servico
    });

  } catch (e) {
    console.error(e);
    res.status(500).send("Erro interno");
  }
};

exports.postAvaliacaoServico = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { idEvento, idServico } = req.params;
  const { nota, comentario } = req.body;

  try {
    const servicoRef = db.collection("usuarios")
      .doc(req.user.uid)
      .collection("eventos")
      .doc(idEvento)
      .collection("meus_servicos")
      .doc(idServico);

    await servicoRef.update({
      avaliacao: {
        nota: Number(nota),
        comentario,
        data: new Date()
      }
    });

    res.redirect(`/eventos/visualizar/${idEvento}`);

  } catch (e) {
    console.error(e);
    res.status(500).send("Erro ao salvar avaliação");
  }
};


exports.verAvaliacao = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { idEvento, idServico } = req.params;

  const ref = db.collection("usuarios")
    .doc(req.user.uid)
    .collection("eventos")
    .doc(idEvento)
    .collection("meus_servicos")
    .doc(idServico);

  const doc = await ref.get();
  if (!doc.exists) return res.status(404).send("Serviço não encontrado");

  const servico = doc.data();

  res.render("eventos/verAvaliacao", {
    user: req.user,
    eventoId: idEvento,
    servicoId: idServico,
    servico
  });
};


exports.getEditarAvaliacao = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { idEvento, idServico } = req.params;

  const ref = db.collection("usuarios")
    .doc(req.user.uid)
    .collection("eventos")
    .doc(idEvento)
    .collection("meus_servicos")
    .doc(idServico);

  const doc = await ref.get();
  if (!doc.exists) return res.status(404).send("Serviço não encontrado");

  const servico = doc.data();

  res.render("eventos/editarAvaliacao", {
    user: req.user,
    eventoId: idEvento,
    servicoId: idServico,
    avaliacao: servico.avaliacao,
    servico
  });
};


exports.postEditarAvaliacao = async (req, res) => {
  const { idEvento, idServico } = req.params;
  const { nota, comentario } = req.body;

  await db.collection("usuarios")
    .doc(req.user.uid)
    .collection("eventos")
    .doc(idEvento)
    .collection("meus_servicos")
    .doc(idServico)
    .update({
      avaliacao: {
        nota: Number(nota),
        comentario,
        data: new Date()
      }
    });

  res.redirect(`/eventos/visualizar/${idEvento}`);
};


exports.excluirAvaliacao = async (req, res) => {
  const { idEvento, idServico } = req.params;

  await db.collection("usuarios")
    .doc(req.user.uid)
    .collection("eventos")
    .doc(idEvento)
    .collection("meus_servicos")
    .doc(idServico)
    .update({
      avaliacao: admin.firestore.FieldValue.delete()
    });

  res.redirect(`/eventos/visualizar/${idEvento}`);
};
