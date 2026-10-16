import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BadgeCheck, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateAdmin } from "@/features/auth/authSlice";
import { changeAdminPassword, getAdminProfile, updateAdminProfile } from "@/features/auth/profileService";

const initials = (name = "Admin") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const errorMessage = (error) => error.response?.data?.message || error.message || "Something went wrong. Please try again.";

function Profile() {
  const dispatch = useDispatch();
  const cachedAdmin = useSelector((state) => state.auth.admin);
  const [profile, setProfile] = useState(cachedAdmin || {});
  const [name, setName] = useState(cachedAdmin?.name || "");
  const [email, setEmail] = useState(cachedAdmin?.email || "");
  const [profileState, setProfileState] = useState({ loading: true, saving: false, error: "", success: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [visible, setVisible] = useState({});
  const [passwordState, setPasswordState] = useState({ saving: false, error: "", success: "" });

  useEffect(() => {
    let active = true;
    getAdminProfile().then((user) => {
      if (!active) return;
      dispatch(updateAdmin(user)); setProfile(user); setName(user.name || ""); setEmail(user.email || "");
      setProfileState((state) => ({ ...state, loading: false }));
    }).catch((error) => active && setProfileState((state) => ({ ...state, loading: false, error: errorMessage(error) })));
    return () => { active = false; };
  }, [dispatch]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileState({ loading: false, saving: true, error: "", success: "" });
    try {
      const updated = await updateAdminProfile({ name: name.trim(), email: email.trim() });
      dispatch(updateAdmin(updated)); setProfile(updated);
      setProfileState({ loading: false, saving: false, error: "", success: "Your profile has been saved." });
    } catch (error) {
      setProfileState({ loading: false, saving: false, error: errorMessage(error), success: "" });
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordState({ saving: false, error: "", success: "" });
    if (passwords.newPassword.length < 6) return setPasswordState({ saving: false, error: "Use at least 6 characters for your new password.", success: "" });
    if (passwords.newPassword !== passwords.confirmPassword) return setPasswordState({ saving: false, error: "The new passwords do not match.", success: "" });
    setPasswordState({ saving: true, error: "", success: "" });
    try {
      const response = await changeAdminPassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordState({ saving: false, error: "", success: response.data.message || "Password changed successfully." });
    } catch (error) {
      setPasswordState({ saving: false, error: errorMessage(error), success: "" });
    }
  };

  const passwordField = (key, label, autoComplete) => (
    <div className="space-y-2" key={key}>
      <label htmlFor={key} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input id={key} type={visible[key] ? "text" : "password"} autoComplete={autoComplete} value={passwords[key]} onChange={(event) => setPasswords({ ...passwords, [key]: event.target.value })} required minLength={key === "currentPassword" ? undefined : 6} className="pr-11" />
        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 size-8 -translate-y-1/2" onClick={() => setVisible({ ...visible, [key]: !visible[key] })} aria-label={`${visible[key] ? "Hide" : "Show"} ${label.toLowerCase()}`}>
          {visible[key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><p className="text-sm text-muted-foreground">Account</p><h1 className="text-2xl font-bold tracking-tight">Admin profile</h1><p className="mt-1 text-sm text-muted-foreground">Manage your account details and security.</p></div>
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/15 via-muted to-primary/5" />
        <CardContent className="relative flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-12 flex items-end gap-4">
            <Avatar className="size-20 border-4 border-background shadow-sm"><AvatarImage src={profile.imageUrl} alt={profile.name || "Admin"} /><AvatarFallback className="text-xl font-semibold">{initials(profile.name)}</AvatarFallback></Avatar>
            <div className="pb-1"><h2 className="text-xl font-semibold">{profile.name || "Admin"}</h2><p className="text-sm text-muted-foreground">{profile.email || ""}</p></div>
          </div>
          <div className="flex flex-wrap gap-2"><Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3.5" />{profile.role || "admin"}</Badge><Badge variant={profile.status === "blocked" ? "destructive" : "outline"} className="gap-1"><BadgeCheck className="size-3.5" />{profile.status || "active"}</Badge></div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="size-5" />Personal information</CardTitle><CardDescription>Update the name and email linked to your admin account.</CardDescription></CardHeader>
          <CardContent><form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2"><label htmlFor="profile-name" className="text-sm font-medium">Full name</label><Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" /></div>
            <div className="space-y-2"><label htmlFor="profile-email" className="text-sm font-medium">Email address</label><Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></div>
            {profileState.error && <p role="alert" className="text-sm text-destructive">{profileState.error}</p>}
            {profileState.success && <p role="status" className="text-sm text-emerald-600">{profileState.success}</p>}
            <Button type="submit" disabled={profileState.loading || profileState.saving}>{profileState.saving && <LoaderCircle className="mr-2 size-4 animate-spin" />}{profileState.saving ? "Saving…" : "Save changes"}</Button>
          </form></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="size-5" />Change password</CardTitle><CardDescription>Confirm your current password to set a new one.</CardDescription></CardHeader>
          <CardContent><form onSubmit={savePassword} className="space-y-4">
            {passwordField("currentPassword", "Current password", "current-password")}
            {passwordField("newPassword", "New password", "new-password")}
            {passwordField("confirmPassword", "Confirm new password", "new-password")}
            {passwordState.error && <p role="alert" className="text-sm text-destructive">{passwordState.error}</p>}
            {passwordState.success && <p role="status" className="text-sm text-emerald-600">{passwordState.success}</p>}
            <Button type="submit" disabled={passwordState.saving}>{passwordState.saving && <LoaderCircle className="mr-2 size-4 animate-spin" />}{passwordState.saving ? "Updating…" : "Update password"}</Button>
          </form></CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
