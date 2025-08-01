import { z } from "zod";

export const fileSchema = z.object({
  name: z.string().min(1, "Name Required"),
  description: z.string().min(1, "Description Required"),
  workspaceId: z.string().min(1, "WorkspaceId Required"),
  parentId: z.string().optional(),
  isFolder: z.boolean().optional(),
  content: z.string().optional(),
  isPublic: z.boolean().optional(),
});
