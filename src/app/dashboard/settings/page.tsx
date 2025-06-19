
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, UserCog, AlertTriangle, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Settings"
        description="Manage your Zelo account preferences and settings."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"> {}
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input type="password" id="currentPassword" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input type="password" id="newPassword" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input type="password" id="confirmNewPassword" placeholder="••••••••" />
            </div>
            <Button>Update Password</Button>
            <Separator className="my-4"/>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Switch id="twoFactorAuth" />
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</CardTitle>
            <CardDescription>Control how you receive notifications from Zelo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationToggle id="emailNotifications" label="Email Notifications" description="Receive important updates via email." defaultChecked />
            <NotificationToggle id="pushNotifications" label="Push Notifications" description="Get real-time alerts on your device." />
            <NotificationToggle id="newMessageAlerts" label="New Message Alerts" description="Notify me when I receive a new message." defaultChecked />
            <NotificationToggle id="jobUpdateAlerts" label="Job Update Alerts" description="Alerts for offers, job status changes, etc." defaultChecked />
          </CardContent>
        </Card>
        
        
        <Card className="md:col-span-2 lg:col-span-2"> {}
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><UserCog className="h-5 w-5 text-primary" /> Manage Account</CardTitle>
                <CardDescription>Manage your account status, including suspension or permanent deletion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Suspend Account</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        Suspending your account will temporarily deactivate it. Your profile and listings will not be visible,
                        but your data will be retained. You can reactivate your account at any time by logging back in.
                    </p>
                    <Button variant="outline">Suspend My Account</Button>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold text-destructive mb-1 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4"/> Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        Permanently deleting your account is irreversible. All your profile information, job history, messages,
                        and payment details will be permanently removed. This action cannot be undone.
                    </p>
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete My Account Permanently</Button>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function NotificationToggle({ id, label, description, defaultChecked = false }: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between space-x-2 rounded-md border p-3 shadow-sm">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}
