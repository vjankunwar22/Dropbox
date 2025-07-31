import { z } from "zod";

export const fileSchema = z.object({
  name: z.string().min(1, "Name Required"),
  description: z.string().min(1, "Description Required"),
  
});


