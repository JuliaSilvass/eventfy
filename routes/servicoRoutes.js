const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { checkAuth } = require("../middlewares/authMiddleware");
const servicoController = require("../controllers/servicoController");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


router.get("/", checkAuth, servicoController.listarServicos);
router.get("/cadastrar", checkAuth, servicoController.getServicoForm);
router.post("/cadastrar", checkAuth, upload.array("imagens", 5), servicoController.createServicoPost);
router.get("/editar/:id", checkAuth, servicoController.getEditarServico);
router.post("/editar/:id", checkAuth, upload.array("imagens", 5), servicoController.editarServicoPost);
router.delete("/apagar/:id", checkAuth, servicoController.apagarServico);
router.get("/:id", checkAuth, servicoController.getViewServico);


module.exports = router;
