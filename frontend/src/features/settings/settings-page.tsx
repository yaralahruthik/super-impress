import { Link } from "@tanstack/react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DeleteAccountCard from "./delete-account-card";
import LinkedinConnectionCard from "./linkedin/linkedin-connection-card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Security</h2>
        <Link to="/settings/change-password">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Integrations</h2>
        <LinkedinConnectionCard />
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Danger Zone</h2>
        <DeleteAccountCard />
      </section>
    </div>
  );
}
