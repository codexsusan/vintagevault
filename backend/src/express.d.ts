import { User } from "./src/types";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export function json(): any {
  throw new Error("Function not implemented.");
}

