import UserSettingsPage from "../pages/settings/UserSettingsPage";
import AccountPage from "../pages/settings/AccountPage";
import ActivityPage from "../pages/settings/ActivityPage";
import NotificationSettingsPage from "../pages/settings/NotificationSettingsPage";

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
    path: "settings/activity",
    element: <ActivityPage />,
  },
  {
    path: "settings/notifications",
    element: <NotificationSettingsPage />,
  },
];