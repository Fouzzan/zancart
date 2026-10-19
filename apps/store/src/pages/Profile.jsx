import axios from "axios";
import bcrypt from "bcryptjs";
import {
  Camera,
  Eye,
  EyeOff,
  Heart,
  LogOut,
  MapPin,
  Package,
  Save,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadProductImage } from "../../../admin/src/features/products/imageUploadService";
import { useAuthContext } from "../context/AuthContext";

const DEFAULT_PREFERENCES = {
  orderUpdates: true,
  promotionalEmails: false,
};

const AUTH_DB_URL = import.meta.env.VITE_AUTH_DB_URL || "http://127.0.0.1:3002";

const authDb = axios.create({
  baseURL: AUTH_DB_URL,
  headers: { "Content-Type": "application/json" },
});

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

function Profile() {
  const { user, logout, updateUser } = useAuthContext();

  const [activeSection, setActiveSection] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: submitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: submitPassword,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch("newPassword");

  useEffect(() => {
    resetProfile({
      name: user?.name || "",
      phone: user?.phone || "",
    });
  }, [user, resetProfile]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zancart_preferences");

      if (saved) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...JSON.parse(saved),
        });
      }
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  // Upload the selected image to Cloudinary and save only its URL.
  const handleProfileImageChange = async (event) => {
    const input = event.target;
    const file = input.files?.[0];

    input.value = "";

    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5 MB.");
      return;
    }

    if (!user?.id) {
      toast.error("Please log in again to update your picture.");
      return;
    }

    setSavingImage(true);

    try {
      const imageUrl = await uploadProductImage(
        file,
        "zancart/customer-profiles",
      );

      if (typeof imageUrl !== "string" || !imageUrl.startsWith("https://")) {
        throw new Error("Cloudinary did not return a valid image URL.");
      }

      const response = await authDb.patch(
        `/users/${encodeURIComponent(String(user.id))}`,
        { imageUrl },
      );

      updateUser(response.data);

      toast.success("Profile picture updated successfully.");
    } catch (error) {
      console.error("Profile picture upload failed:", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });

      toast.error(
        getErrorMessage(error, "Unable to update your profile picture."),
      );
    } finally {
      setSavingImage(false);
    }
  };

  // Remove the image from the user's profile.
  const handleRemoveProfileImage = async () => {
    if (!user?.id || !user?.imageUrl) {
      toast.error("No profile picture to remove.");
      return;
    }

    setSavingImage(true);

    try {
      const response = await authDb.patch(
        `/users/${encodeURIComponent(String(user.id))}`,
        { imageUrl: null },
      );

      updateUser(response.data);

      toast.success("Profile picture removed successfully.");
    } catch (error) {
      console.error("Profile picture removal failed:", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });

      toast.error(
        getErrorMessage(error, "Unable to remove your profile picture."),
      );
    } finally {
      setSavingImage(false);
    }
  };

  const handleProfileSave = async (data) => {
    if (!user?.id) {
      toast.error("Please log in again to update your profile.");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await authDb.patch(
        `/users/${encodeURIComponent(String(user.id))}`,
        {
          name: data.name.trim(),
          phone: data.phone.trim(),
        },
      );

      updateUser(response.data);

      resetProfile({
        name: response.data.name || "",
        phone: response.data.phone || "",
      });

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update failed:", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });

      toast.error(getErrorMessage(error, "Unable to update your profile."));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (data) => {
    if (!user?.id) {
      toast.error("Please log in again to change your password.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await authDb.get(
        `/users/${encodeURIComponent(String(user.id))}`,
      );

      const account = response.data;

      if (account.isBlocked || account.status === "blocked") {
        toast.error("This account is blocked.");
        logout();
        return;
      }

      const passwordMatches = await bcrypt.compare(
        data.currentPassword,
        account.password || "",
      );

      if (!passwordMatches) {
        toast.error("Current password is incorrect.");
        return;
      }

      if (data.newPassword.length < 8) {
        toast.error("Password must contain at least 8 characters.");
        return;
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 12);

      await authDb.patch(`/users/${encodeURIComponent(String(user.id))}`, {
        password: hashedPassword,
      });

      resetPassword();
      toast.success("Password changed successfully.");
    } catch (error) {
      console.error("Password change failed:", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });

      toast.error(getErrorMessage(error, "Unable to change your password."));
    } finally {
      setChangingPassword(false);
    }
  };

  const savePreferences = () => {
    try {
      localStorage.setItem("zancart_preferences", JSON.stringify(preferences));

      toast.success("Preferences saved.");
    } catch {
      toast.error("Unable to save preferences.");
    }
  };

  const sections = [
    { id: "profile", label: "Personal Information", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  const shortcuts = [
    { label: "My Orders", path: "/orders", icon: Package },
    { label: "My Addresses", path: "/addresses", icon: MapPin },
    { label: "My Wishlist", path: "/wishlist", icon: Heart },
    { label: "My Cart", path: "/cart", icon: ShoppingCart },
  ];

  const displayName = user?.name || "ZanCart Customer";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Home / My Account</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">My Profile</h1>

        <p className="mt-2 text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile summary and picture controls */}
      <section className="mb-8 flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center">
        <div className="relative h-16 w-16 shrink-0">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={`${displayName}'s profile`}
              className="h-16 w-16 rounded-full border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold">
              {initials || <UserRound className="h-7 w-7" />}
            </div>
          )}

          <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
            <label
              title="Change profile picture"
              className={`flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm ${
                savingImage
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-muted"
              }`}
            >
              {savingImage ? (
                <span className="text-xs">...</span>
              ) : (
                <Camera className="h-4 w-4" />
              )}

              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleProfileImageChange}
                disabled={savingImage}
              />
            </label>

            {user?.imageUrl && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                title="Remove profile picture"
                aria-label="Remove profile picture"
                className="h-8 w-8 rounded-full"
                onClick={handleRemoveProfileImage}
                disabled={savingImage}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">{displayName}</h2>

          <p className="mt-1 break-all text-sm text-muted-foreground">
            {user?.email || "No email available"}
          </p>

          <p className="mt-2 text-xs capitalize text-muted-foreground">
            Account type: {user?.role || "customer"}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            {savingImage
              ? "Uploading or updating picture..."
              : "Use the camera to change your picture or the trash icon to remove it."}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={logout}
          className="rounded-full"
          disabled={savingImage}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="space-y-2">
          <div className="rounded-2xl border p-3">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Settings
            </p>

            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border p-3">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Links
            </p>

            {shortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border p-5 sm:p-8">
          {activeSection === "profile" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Update the details associated with your account.
                </p>
              </div>

              <form
                onSubmit={submitProfile(handleProfileSave)}
                className="max-w-xl space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>

                  <Input
                    {...registerProfile("name", {
                      required: "Name is required.",
                      minLength: {
                        value: 2,
                        message: "Name must have at least 2 characters.",
                      },
                    })}
                    placeholder="Your full name"
                  />

                  {profileErrors.name && (
                    <p className="text-sm text-destructive">
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>

                  <Input
                    value={user?.email || ""}
                    readOnly
                    className="bg-muted"
                  />

                  <p className="text-xs text-muted-foreground">
                    Email editing is disabled until email verification is
                    implemented.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>

                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    {...registerProfile("phone", {
                      pattern: {
                        value: /^\+?[0-9\s-]{7,15}$/,
                        message: "Enter a valid phone number.",
                      },
                    })}
                  />

                  {profileErrors.phone && (
                    <p className="text-sm text-destructive">
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </>
          )}

          {activeSection === "security" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Security & Password</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a strong password to protect your account.
                </p>
              </div>

              <form
                onSubmit={submitPassword(handlePasswordChange)}
                className="max-w-xl space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Current Password
                  </label>

                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-11"
                      {...registerPassword("currentPassword", {
                        required: "Enter your current password.",
                      })}
                    />

                    <button
                      type="button"
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                      onClick={() => setShowCurrentPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>

                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pr-11"
                      {...registerPassword("newPassword", {
                        required: "Enter a new password.",
                        minLength: {
                          value: 8,
                          message: "Password must have at least 8 characters.",
                        },
                      })}
                    />

                    <button
                      type="button"
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      onClick={() => setShowNewPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>

                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...registerPassword("confirmPassword", {
                      required: "Confirm your new password.",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match.",
                    })}
                  />

                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-full"
                >
                  {changingPassword ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
