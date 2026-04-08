import { publicRoutes } from "./publicRoutes";
import { protectedRoutes } from "./protectedRoutes";

export const appRoutes = [
  ...publicRoutes,
  protectedRoutes,
];