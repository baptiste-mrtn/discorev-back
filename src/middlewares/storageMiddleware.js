import multer from "multer";
import path from "path";
import fs from "fs";

// Configurez le stockage de Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		let uploadPath;

		// Vérifie la visibilité du fichier
		if (req.body.visibility === "private" || req.body.visibility === "shared") {
			uploadPath = path.join("uploads", req.user.id.toString(), req.body.visibility);
		} else {
			uploadPath = path.join("uploads", "public");
		}

		// Crée le dossier si nécessaire
		fs.mkdirSync(uploadPath, { recursive: true });

		cb(null, uploadPath); // Définit le dossier de destination
	},
	filename: (req, file, cb) => {
		const now = new Date();
		const uniqueId = `${Date.now()}`;
		const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
			now.getMonth() + 1
		).padStart(2, "0")}-${now.getFullYear()}`;
		const originalName = path.parse(file.originalname).name.replace(/\s+/g, "_"); // Retire les espaces
		const extname = path.extname(file.originalname); // Garde l'extension du fichier

		const finalName = `${formattedDate}-${originalName}-${uniqueId}${extname}`;

		cb(null, finalName); // Conserve le vrai nom avec une ID unique
	}
});

// Configurez Multer pour accepter un champ de fichier spécifique
const fileFilter = (req, file, cb) => {
	const filetypes = /jpeg|jpg|png|pdf/; // Types de fichiers acceptés
	const mimetype = filetypes.test(file.mimetype);
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

	if (mimetype && extname) {
		console.log(mimetype);
		console.log(extname);

		return cb(null, true);
	} else {
		cb(new Error("Only images and PDFs are allowed"));
	}
};

export const configurationStorage = () => multer({ storage, fileFilter });
