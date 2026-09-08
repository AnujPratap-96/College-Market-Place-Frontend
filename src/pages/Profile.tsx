import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Save, X, User, Mail, Phone, GraduationCap, Edit2 } from "lucide-react";
import type { RootState } from "@/store/store";
import { fetchUserProfile, updateUserProfile, type IUserProfile } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Profile = () => {
  const reduxUser = useSelector((state: RootState) => state.user);
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: reduxUser.name || "",
    phoneNo: reduxUser.phone || "",
    college: reduxUser.college || "",
    branch: reduxUser.branch || "",
    year: reduxUser.year || "",
    image: reduxUser.photoUrl || "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await fetchUserProfile();
    if (result.success) {
      setProfile(result.success);
      setForm({
        name: result.success.name || reduxUser.name || "",
        phoneNo: result.success.phoneNo || reduxUser.phone || "",
        college: result.success.college || reduxUser.college || "",
        branch: (result.success as any).branch || reduxUser.branch || "",
        year: (result.success as any).year || reduxUser.year || "",
        image: result.success.image || reduxUser.photoUrl || "",
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setEditing(true);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    const result = await updateUserProfile({
      name: form.name,
      phoneNo: form.phoneNo,
      college: form.college,
      branch: form.branch,
      year: form.year,
      image: form.image,
    });

    if (result.success) {
      setSuccess(true);
      setEditing(false);
    } else {
      setError(result.error || "Failed to update profile");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setSuccess(false);
    if (profile) {
      setForm({
        name: profile.name || reduxUser.name || "",
        phoneNo: profile.phoneNo || reduxUser.phone || "",
        college: profile.college || reduxUser.college || "",
        branch: (profile as any).branch || reduxUser.branch || "",
        year: (profile as any).year || reduxUser.year || "",
        image: profile.image || reduxUser.photoUrl || "",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 relative">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage src={form.image} />
              <AvatarFallback className="text-3xl">
                {form.name.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{form.name}</CardTitle>
          <CardDescription>{reduxUser.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                value={reduxUser.email}
                disabled
                className="bg-muted/50"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNo" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phoneNo"
                name="phoneNo"
                value={form.phoneNo}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter phone number"
              />
            </div>

            {/* College */}
            <div className="space-y-2">
              <Label htmlFor="college" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                College
              </Label>
              <Input
                id="college"
                name="college"
                value={form.college}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter college name"
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500 text-sm">
                Profile updated successfully!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {editing ? (
                <>
                  <Button type="submit" disabled={saving} className="gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;