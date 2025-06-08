import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Palette, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Settings"
        description="Manage your Zelo account preferences and settings."
        icon={Settings}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Account Information Card - could link to profile edit */}
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

        {/* Notification Settings Card */}
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
        
        {/* Theme/Appearance Card (Optional) */}
         <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</CardTitle>
            <CardDescription>Customize the look and feel of Zelo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="darkMode" className="font-medium">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
                </div>
                <Switch id="darkMode" />
            </div>
            {/* Other appearance settings can go here */}
          </CardContent>
        </Card>

        {/* Delete Account Card */}
        <Card className="md:col-span-2 lg:col-span-3 border-destructive">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" /> Delete Account</CardTitle>
                <CardDescription className="text-destructive/80">Permanently delete your Zelo account and all associated data.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    This action is irreversible. Please be sure you want to proceed. All your profile information, job history, messages, and payment details will be permanently removed.
                </p>
                <Button variant="destructive">Delete My Account</Button>
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
