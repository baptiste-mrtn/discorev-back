import express from "express";
import DocumentController from "../controllers/documentController.js";
import DocumentPermissionsController from "../controllers/documentPermissionsController.js";
import { authenticateToken, authenticateTokenOptional } from "../middlewares/authMiddleware.js";
import { configurationStorage } from "../middlewares/storageMiddleware.js";

const multer = configurationStorage();
const router = express.Router();

router.post(
	"/upload",
	authenticateToken,
	multer.single("file_path"),
	DocumentController.uploadDocument
);
router.get("/download/:documentId", authenticateTokenOptional, DocumentController.downloadDocument);
router.get("/user/:senderId", authenticateToken, DocumentController.getUserDocuments);
router.delete("/:documentId", authenticateToken, DocumentController.deleteDocument);

//Permissions
router.put("/share", authenticateToken, DocumentPermissionsController.shareDocument);
router.get(
	"/:documentId/permissions",
	authenticateToken,
	DocumentPermissionsController.getDocumentPermissions
);
router.put(
	"/:documentId/permissions",
	authenticateToken,
	DocumentPermissionsController.updateDocumentPermissions
);
router.delete(
	"/:documentId/permissions",
	authenticateToken,
	DocumentPermissionsController.revokeUserPermission
);
router.purge(
	"/:documentId/permissions",
	authenticateToken,
	DocumentPermissionsController.deleteAllPermissions
);

export default router;
