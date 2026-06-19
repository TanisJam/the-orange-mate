"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, User } from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  getAllInterests,
  getUserInterests,
  addUserInterest,
  removeUserInterest,
} from "@/lib/database-client";
import type { UserProfile, Interest, UserInterest } from "@/lib/types";
import { COUNTRIES } from "@/lib/types";

interface UserProfileFormProps {
  userId: string;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export function UserProfileForm({ userId, onProfileUpdated }: UserProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCustomInterest, setNewCustomInterest] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    age: "",
    country: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileData, allInterests, profileInterests] = await Promise.all([
        getUserProfile(userId),
        getAllInterests(),
        getUserInterests(userId),
      ]);

      setProfile(profileData);
      setInterests(allInterests);
      setUserInterests(profileInterests);

      if (profileData) {
        setFormData({
          username: profileData.username || "",
          full_name: profileData.full_name || "",
          bio: profileData.bio || "",
          age: profileData.age?.toString() || "",
          country: profileData.country || "",
          city: profileData.city || "",
          phone: profileData.phone || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const profileData = {
        username: formData.username || undefined,
        full_name: formData.full_name || undefined,
        bio: formData.bio || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        phone: formData.phone || undefined,
      };

      let updatedProfile;
      if (profile) {
        updatedProfile = await updateUserProfile(userId, profileData);
      } else {
        updatedProfile = await createUserProfile(userId, profileData);
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        onProfileUpdated?.(updatedProfile);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = async (interestId: string) => {
    try {
      const result = await addUserInterest(userId, interestId);
      if (result) {
        setUserInterests([...userInterests, result]);
      }
    } catch (error) {
      console.error("Error adding interest:", error);
    }
  };

  const handleAddCustomInterest = async () => {
    if (!newCustomInterest.trim()) return;

    try {
      // Create a custom interest entry
      const supabase = createClient();
      const { data: customInterest, error } = await supabase
        .from("interests")
        .insert({
          name: newCustomInterest,
          is_predefined: false,
        })
        .select()
        .single();

      if (error) throw error;

      const result = await addUserInterest(userId, customInterest.id, true, newCustomInterest);
      if (result) {
        setUserInterests([...userInterests, result]);
        setNewCustomInterest("");
      }
    } catch (error) {
      console.error("Error adding custom interest:", error);
    }
  };

  const handleRemoveInterest = async (userInterestId: string) => {
    try {
      const success = await removeUserInterest(userInterestId);
      if (success) {
        setUserInterests(userInterests.filter(ui => ui.id !== userInterestId));
      }
    } catch (error) {
      console.error("Error removing interest:", error);
    }
  };

  const availableInterests = interests.filter(
    interest => !userInterests.some(ui => ui.interest_id === interest.id)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <User className="w-8 h-8 mx-auto mb-2 text-neutral-gray" />
            <p>Cargando perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Completa tu perfil para que otros viajeros puedan conocerte mejor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@usuario"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Biografía</Label>
            <textarea
              id="bio"
              className="flex min-h-[80px] w-full rounded-[--radius] border-2 border-neutral-black bg-neutral-white px-3 py-2 text-sm ring-offset-neutral-white placeholder:text-neutral-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-gray dark:bg-neutral-light dark:ring-offset-neutral-gray dark:placeholder:text-neutral-gray dark:focus-visible:ring-primary-light"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Cuéntanos sobre ti, qué tipo de viajero eres, qué buscas..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
              />
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Tu ciudad"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Intereses y Preferencias</CardTitle>
          <CardDescription>
            Agrega badges que describan tus intereses de viaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Interests */}
          {userInterests.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tus Intereses:</h4>
              <div className="flex flex-wrap gap-2">
                {userInterests.map((userInterest) => (
                  <Badge
                    key={userInterest.id}
                    variant="default"
                    className="flex items-center gap-1"
                  >
                    {userInterest.interest?.icon} {userInterest.custom_name || userInterest.interest?.name}
                    <button
                      onClick={() => handleRemoveInterest(userInterest.id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Interests */}
          {availableInterests.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Agregar Intereses:</h4>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => handleAddInterest(interest.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm border-2 border-neutral-black bg-neutral-white rounded-[--radius] hover:bg-primary hover:text-white transition-colors dark:border-neutral-gray dark:bg-neutral-light dark:hover:bg-primary-light dark:hover:text-neutral-black"
                  >
                    {interest.icon} {interest.name}
                    <Plus className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Interest */}
          <div>
            <h4 className="font-semibold mb-2">Crear Interés Personalizado:</h4>
            <div className="flex gap-2">
              <Input
                value={newCustomInterest}
                onChange={(e) => setNewCustomInterest(e.target.value)}
                placeholder="Nuevo interés personalizado"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()}
              />
              <Button onClick={handleAddCustomInterest} disabled={!newCustomInterest.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-8"
          variant="primary"
        >
          {saving ? "Guardando..." : "Guardar Perfil"}
        </Button>
      </div>
    </div>
  );
} 