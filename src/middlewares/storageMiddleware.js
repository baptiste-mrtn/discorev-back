import multer from "multer";
import path from "path";
import fs from "fs";

// Configurez le stockage de Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const userId = req.user.id.toString();
		const visibility = req.body.visibility || "public";
		const mediaType = req.body.type || "other";

		const folders = {
			profile_picture: "profile_pictures",
			company_logo: "logos",
			company_banner: "banners",
			company_image: "images",
			company_video: "videos",
		};

		const folderName = folders[mediaType] || "others";

		const basePath = visibility === "private" || visibility === "shared"
			? path.posix.join("uploads", userId, visibility, folderName)
			: path.posix.join("uploads", "public", folderName);

		fs.mkdirSync(basePath, { recursive: true });
		cb(null, basePath);
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
		return cb(null, true);
	} else {
		cb(new Error("Only images and PDFs are allowed"));
	}
};

export const configurationStorage = () => multer({ storage, fileFilter });
