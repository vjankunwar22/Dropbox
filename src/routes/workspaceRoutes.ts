import { Router } from "express";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";
import {
  createSpace,
  deleteWorkspace,
  getAllWorkspace,
  inviteUserToWorkspace,

  
  respondToWorkspaceInvite,
  updateWorkspace,
} from "../controllers/workspaceController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  InviteSchema,
  RespondInvitedSchema,
  WorkspaceSchema,
} from "../validations/workspaceValidtaions";
import { isWorkspaceAdmin } from "../middlewares/workSpaceMiddleware";

const router = Router();

router.post(
  "/create",
  authenticateJWT,
  validateRequest(WorkspaceSchema),
  createSpace
);
router.post(
  "/invite",
  authenticateJWT,
  inviteUserToWorkspace,
  validateRequest(InviteSchema)
);
router.post(
  "/respond-invite",
  authenticateJWT,
  respondToWorkspaceInvite,
  validateRequest(RespondInvitedSchema)
);
router.get("/all", authenticateJWT, isAdmin, getAllWorkspace);

router.delete("/:id", authenticateJWT, isWorkspaceAdmin, deleteWorkspace);

router.put(
  "/updateWorkspace/:id",
  authenticateJWT,
  isAdmin,
  isWorkspaceAdmin,
  updateWorkspace,
  validateRequest(WorkspaceSchema)
);

// router.delete(
//   "/remove-user",
//   authenticateJWT,
//   isAdmin,
//   isWorkspaceAdmin, // optional, since we check admin in controller too
//   removeUserWorkSpace
// );

export default router;
