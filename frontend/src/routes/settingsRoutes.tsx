import UserSettingsPage from "../pages/UserSettingsPage";
import AccountPage from "../pages/AccountPage";
import EditorThemeTemplatesPage from "../pages/EditorThemeTemplatesPage";
import ActivityPage from "../pages/ActivityPage";
import NotificationSettingsPage from "../pages/NotificationSettingsPage";

export const settingsRoutes = [
  {
    path: "settings",
    element: <UserSettingsPage />,
  },
  {
    path: "settings/account",
    element: <AccountPage />,
  },
  {
    path: "settings/editor-theme-templates",
    element: <EditorThemeTemplatesPage />,
  },
  {
    path: "settings/activity",
    element: <ActivityPage />,
  },
  {
    path: "settings/notifications",
    element: <NotificationSettingsPage />,
  },
];