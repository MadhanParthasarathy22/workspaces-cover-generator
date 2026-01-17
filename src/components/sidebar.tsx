import { SidebarClient } from "./sidebar-client";
import { navigation } from "./sidebar-config";

export function Sidebar() {
  return <SidebarClient navigation={navigation} />;
}
