// frontend/src/routes/index.ts
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { createBrowserRouter } from 'react-router-dom';

export const appRoutes = [...publicRoutes, protectedRoutes];
export const router = createBrowserRouter(appRoutes);
