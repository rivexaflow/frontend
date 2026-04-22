import { z } from "zod";

export const idParamSchema = z.string().min(1);
