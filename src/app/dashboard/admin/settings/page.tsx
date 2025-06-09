
"use client"; // Added to allow client-side interactivity if any button needs it

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, UploadCloud, Palette, ListChecks, Briefcase } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPlatformSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Settings"
        description="Manage global settings, branding, and feature configurations for Zelo."
        icon={Settings}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/> Branding & Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the Zelo platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input id="platformName" defaultValue="Zelo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUpload">Platform Logo</Label>
              <div className="flex items-center gap-4">
                <img src="https://placehold.co/100x40.png?text=Zelo+Logo" alt="Current Logo" className="h-10 border p-1 rounded bg-muted" data-ai-hint="logo simple"/>
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="logoUploadInput" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4" /> Change Logo
                  </label>
                </Button>
                <Input id="logoUploadInput" type="file" className="sr-only" accept="image/png, image/svg+xml" />
              </div>
              <p className="text-xs text-muted-foreground">Recommended: SVG or transparent PNG, max 200x50px.</p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="platformPrimaryColor">Primary Color (Hex)</Label>
                <Input id="platformPrimaryColor" defaultValue="#05BA05" />
                 <p className="text-xs text-muted-foreground">Changes theme color across the platform. Ensure good contrast.</p>
            </div>
            <Button onClick={() => console.log('Mock: Save Branding Changes')}>Save Branding Changes (Mock)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/> Onboarding & User Flow</CardTitle>
            <CardDescription>Control steps and requirements for user onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Artisan Onboarding Steps</Label>
              <div className="space-y-2 rounded-md border p-3">
                <SettingToggle id="artisanStep1Services" label="Step 1: Select Primary Services (Fixed to 2)" defaultChecked disabled />
                <SettingToggle id="artisanStep2Profile" label="Step 2: Complete Profile Details" defaultChecked />
                <SettingToggle id="artisanStep3Verification" label="Step 3: ID Verification (Future)" />
              </div>
            </div>
             <div className="space-y-2">
              <Label>Client Onboarding Steps</Label>
              <div className="space-y-2 rounded-md border p-3">
                <SettingToggle id="clientStep1Preferences" label="Step 1: Service Preferences" defaultChecked />
                <SettingToggle id="clientStep2Profile" label="Step 2: Basic Profile Setup" defaultChecked />
              </div>
            </div>
            <Button onClick={() => console.log('Mock: Save Onboarding Settings')}>Save Onboarding Settings (Mock)</Button>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Service & Platform Fees</CardTitle>
            <CardDescription>Manage service categories and platform commission rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformFee">Platform Service Fee (%)</Label>
              <Input id="platformFee" type="number" defaultValue="10" min="0" max="50" />
              <p className="text-xs text-muted-foreground">Percentage fee deducted from artisan earnings on completed jobs.</p>
            </div>
            <Separator />
            <div className="space-y-2">
                <Label htmlFor="serviceCategories">Manage Service Categories</Label>
                <Textarea 
                    id="serviceCategories" 
                    defaultValue={"Tailoring/Fashion Design\nPlumbing\nElectrical Services\nCarpentry\nHairdressing/Barbing\n..."}
                    rows={6}
                    placeholder="Enter each category on a new line"
                />
                <p className="text-xs text-muted-foreground">Add, edit, or remove service categories available on the platform. Changes will reflect in onboarding and job posting.</p>
            </div>
            <Button onClick={() => console.log('Mock: Save Fee & Category Settings')}>Save Fee & Category Settings (Mock)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}

function SettingToggle({ id, label, description, defaultChecked = false, disabled = false }: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between space-x-2 rounded-md border border-transparent p-2 hover:border-border hover:bg-accent/50 data-[disabled=true]:opacity-70">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} defaultChecked={defaultChecked} disabled={disabled} />
    </div>
  );
}
