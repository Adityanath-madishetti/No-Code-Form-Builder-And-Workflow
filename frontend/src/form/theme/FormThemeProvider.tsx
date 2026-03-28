// // src/form/theme/FormThemeProvider.tsx

// import { createContext, useContext } from 'react';
// import { buildThemeVars } from './buildThemeVars';
// import type { FormThemeConfig } from './formThemeTypes';

// const FormThemeContext = createContext<FormThemeConfig | null>(null);

// export function FormThemeProvider({ children }: { children: React.ReactNode }) {
//   // 🔥 hardcoded (later from schema)
//   const config: FormThemeConfig = {
//     theme: 'light',
//     base: 'zinc',
//     font: 'sans',
//     radius: 'md',
//     radiusForm: 'md',
//   };

//   const style = buildThemeVars(config);

//   return (
//     <FormThemeContext.Provider value={config}>
//       <div
//         style={style}
//         className={config.theme} // optional: "light" | "dark"
//       >
//         {children}
//       </div>
//     </FormThemeContext.Provider>
//   );
// }

// // eslint-disable-next-line react-refresh/only-export-components
// export function useFormTheme() {
//   const ctx = useContext(FormThemeContext);
//   if (!ctx) {
//     throw new Error('useFormTheme must be used inside FormThemeProvider');
//   }
//   return ctx;
// }

import type { ReactNode } from 'react';
// Import your Zustand store (adjust the path as needed)
// import { useFormStore } from "@/form/store/formStore";

export function FormThemeProvider({ children }: { children: ReactNode }) {
  // Pull the active theme ID (e.g., 'default', 'ocean', 'minimal')
  // const activeTheme = useFormStore((state) => state.themeId);

  // Optional: If your canvas can toggle dark mode independently of the main app
  // const isCanvasDark = useFormStore((state) => state.isCanvasDark);

  return (
    <div
      // className={`theme-hero-${activeTheme} ${isCanvasDark ? "dark" : ""} w-full h-full`}
      className={`form-theme-default bg-background text-foreground min-h-full h-auto w-full`}
      // This ensures the localized background and text colors are applied immediately to the canvas backing
      // style={{
      //   backgroundColor: 'var(--background)',
      //   color: 'var(--foreground)',
      // }}
    >
      {children}
    </div>
  );
}
