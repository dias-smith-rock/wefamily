import { ConsoleLayout } from "./components/console-layout";

const mockUser = {
  name: "Sarah Chen",
  initials: "SC",
  role: "Household Admin",
};

export default function ConsolePage() {
  return <ConsoleLayout user={mockUser} />;
}
