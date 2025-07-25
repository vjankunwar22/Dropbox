import { z } from "zod";

export const WorkspaceSchema = z.object({
  name: z.string().min(1, "Name is Required"),
});

export const InviteSchema = z.object({
  email: z.email().min(1, "Email is Required"),
});

export const RespondInvitedSchema = z.object({
  action: z.enum(["ACCEPTED", "DECLINED"]).optional(),
});
