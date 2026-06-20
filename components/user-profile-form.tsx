"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, User } from "lucide-react";
import { AvatarUpload } from "@/components/avatar-upload";
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

const profileSchema = z.object({
  username: z.string().optional(),
  full_name: z.string().optional(),
  bio: z.string().optional(),
  age: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  userId: string;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export function UserProfileForm({ userId, onProfileUpdated }: UserProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCustomInterest, setNewCustomInterest] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      age: "",
      country: "",
      city: "",
      phone: "",
    },
  });

  useEffect(() => {
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
          form.reset({
            username: profileData.username || "",
            full_name: profileData.full_name || "",
            bio: profileData.bio || "",
            age: profileData.age?.toString() || "",
            country: profileData.country || "",
            city: profileData.city || "",
            phone: profileData.phone || "",
          });
          setAvatarUrl(profileData.avatar_url);
        }
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId, form]);

  const onSubmit = async (values: ProfileValues) => {
    setError(null);
    try {
      const profileData = {
        username: values.username || undefined,
        full_name: values.full_name || undefined,
        bio: values.bio || undefined,
        age: values.age ? parseInt(values.age) : undefined,
        country: values.country || undefined,
        city: values.city || undefined,
        phone: values.phone || undefined,
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
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err instanceof Error ? err.message : "Error al guardar el perfil");
    }
  };

  const handleAddInterest = async (interestId: string) => {
    try {
      const result = await addUserInterest(userId, interestId);
      if (result) {
        setUserInterests([...userInterests, result]);
      }
    } catch (err) {
      console.error("Error adding interest:", err);
    }
  };

  const handleAddCustomInterest = async () => {
    if (!newCustomInterest.trim()) return;

    try {
      const supabase = createClient();
      const { data: customInterest, error: insertError } = await supabase
        .from("interests")
        .insert({
          name: newCustomInterest,
          is_predefined: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const result = await addUserInterest(userId, customInterest.id, true, newCustomInterest);
      if (result) {
        setUserInterests([...userInterests, result]);
        setNewCustomInterest("");
      }
    } catch (err) {
      console.error("Error adding custom interest:", err);
    }
  };

  const handleRemoveInterest = async (userInterestId: string) => {
    try {
      const success = await removeUserInterest(userInterestId);
      if (success) {
        setUserInterests(userInterests.filter(ui => ui.id !== userInterestId));
      }
    } catch (err) {
      console.error("Error removing interest:", err);
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
            <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p>Cargando perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Avatar Upload */}
      <AvatarUpload
        userId={userId}
        currentAvatarUrl={avatarUrl}
        onUploadComplete={(url) => setAvatarUrl(url)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="@usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cuéntanos sobre ti, qué tipo de viajero eres, qué buscas..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="18"
                          max="100"
                          placeholder="25"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p
                  className="text-sm font-body text-error"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-8"
              variant="primary"
            >
              {form.formState.isSubmitting ? "Guardando..." : "Guardar Perfil"}
            </Button>
          </div>
        </form>
      </Form>

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
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm border-2 border-ink bg-card text-card-foreground rounded-[--radius] hover:bg-primary hover:text-neutral-black transition-colors"
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
    </div>
  );
}
