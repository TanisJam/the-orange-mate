"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserProfileForm } from "@/components/user-profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PlusCircle,
  Search,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Heart,
  Plane,
} from "lucide-react";
import {
  getUserProfile,
  getUserTravelPlans,
  getParticipatingPlans,
  searchTravelPlans,
} from "@/lib/database-client";
import type { UserProfile, TravelPlan } from "@/lib/types";
import { PLAN_TYPES, PLAN_STATUSES } from "@/lib/types";

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPlans, setMyPlans] = useState<TravelPlan[]>([]);
  const [participatingPlans, setParticipatingPlans] = useState<TravelPlan[]>([]);
  const [suggestedPlans, setSuggestedPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, userPlans, participatingData, suggestedData] = await Promise.all([
        getUserProfile(userId),
        getUserTravelPlans(userId),
        getParticipatingPlans(userId),
        searchTravelPlans({}, { page: 1, limit: 6 }),
      ]);

      setProfile(profileData);
      setMyPlans(userPlans);
      setParticipatingPlans(participatingData);
      setSuggestedPlans(suggestedData.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlanTypeInfo = (type: string) => {
    return PLAN_TYPES.find(pt => pt.value === type) || PLAN_TYPES[0];
  };

  const getPlanStatusInfo = (status: string) => {
    return PLAN_STATUSES.find(ps => ps.value === status) || PLAN_STATUSES[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Plane className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
          <p className="text-neutral-gray">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading text-primary dark:text-primary-light">
          ¡Bienvenido a SoloTravelers!
        </h1>
        <p className="text-lg font-body text-neutral-gray dark:text-neutral-white max-w-2xl mx-auto">
          Conecta con otros viajeros, descubre planes increíbles y haz que cada aventura sea memorable.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          <TabsTrigger value="plans">Mis Planes</TabsTrigger>
          <TabsTrigger value="discover">Descubrir</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Profile Status */}
          {(!profile || !profile.full_name) && (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  Completa tu perfil
                </CardTitle>
                <CardDescription>
                  Para obtener mejores sugerencias y conectar con otros viajeros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab("profile")} variant="primary">
                  Completar Perfil
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-gray">Mis Planes</p>
                    <p className="text-2xl font-bold text-primary">{myPlans.length}</p>
                  </div>
                  <PlusCircle className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-gray">Participando</p>
                    <p className="text-2xl font-bold text-secondary">{participatingPlans.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-gray">Sugerencias</p>
                    <p className="text-2xl font-bold text-accent">{suggestedPlans.length}</p>
                  </div>
                  <Heart className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Recent Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Planes Recientes</CardTitle>
                <CardDescription>Tus planes de viaje más recientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {myPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <PlusCircle className="w-12 h-12 mx-auto text-neutral-gray mb-4" />
                    <p className="text-neutral-gray mb-4">No tienes planes de viaje aún</p>
                  <Button asChild variant="primary">
                    <Link href="/plans/new">
                      Crear Tu Primer Plan
                    </Link>
                  </Button>
                  </div>
                ) : (
                  myPlans.slice(0, 3).map((plan) => {
                    const typeInfo = getPlanTypeInfo(plan.plan_type);
                    const statusInfo = getPlanStatusInfo(plan.status);
                    
                    return (
                      <div key={plan.id} className="p-3 border rounded-lg hover:bg-neutral-light dark:hover:bg-neutral-gray transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{plan.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-neutral-gray">
                              <span>{typeInfo.icon}</span>
                              <span>{typeInfo.label}</span>
                              <Badge className={statusInfo.color + " text-white text-xs"}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-gray mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {plan.destinations.join(", ")}
                              </span>
                              {plan.start_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(plan.start_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Suggested Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Planes Sugeridos</CardTitle>
                <CardDescription>Descubre planes que podrían interesarte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 mx-auto text-neutral-gray mb-4" />
                    <p className="text-neutral-gray">No hay sugerencias disponibles</p>
                  </div>
                ) : (
                  suggestedPlans.slice(0, 3).map((plan) => {
                    const typeInfo = getPlanTypeInfo(plan.plan_type);
                    
                    return (
                      <div key={plan.id} className="p-3 border rounded-lg hover:bg-neutral-light dark:hover:bg-neutral-gray transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{plan.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-neutral-gray">
                              <span>{typeInfo.icon}</span>
                              <span>{typeInfo.label}</span>
                              <span>• por{' '}
                                <Link
                                  href={`/profile/${plan.creator?.username || plan.creator_id}`}
                                  className="hover:underline"
                                >
                                  {plan.creator?.full_name || plan.creator?.username || 'Usuario'}
                                </Link>
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-gray mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {plan.destinations.join(", ")}
                              </span>
                              {plan.start_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(plan.start_date)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/plans/${plan.id}`}>
                              Ver
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <UserProfileForm userId={userId} onProfileUpdated={handleProfileUpdate} />
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-heading">Mis Planes de Viaje</h2>
              <p className="text-neutral-gray">Gestiona tus planes y ve en cuáles participas</p>
            </div>
            <Button asChild variant="primary">
              <Link href="/plans/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                Crear Nuevo Plan
              </Link>
            </Button>
          </div>

          {/* Plans I Created */}
          <Card>
            <CardHeader>
              <CardTitle>Planes que he creado ({myPlans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {myPlans.length === 0 ? (
                <div className="text-center py-12">
                  <PlusCircle className="w-16 h-16 mx-auto text-neutral-gray mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes planes creados</h3>
                  <p className="text-neutral-gray mb-6">Crea tu primer plan de viaje y conecta con otros viajeros</p>
                  <Button asChild variant="primary">
                    <Link href="/plans/new">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Crear Mi Primer Plan
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPlans.map((plan) => {
                    const typeInfo = getPlanTypeInfo(plan.plan_type);
                    const statusInfo = getPlanStatusInfo(plan.status);
                    
                    return (
                      <div key={plan.id} className="p-4 border-2 border-neutral-black rounded-lg bg-neutral-white dark:border-neutral-gray dark:bg-neutral-light">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{typeInfo.icon}</span>
                            <h3 className="font-semibold">{plan.title}</h3>
                          </div>
                          <Badge className={statusInfo.color + " text-white"}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-1 text-neutral-gray">
                            <MapPin className="w-4 h-4" />
                            <span>{plan.destinations.join(", ")}</span>
                          </div>
                          
                          {plan.start_date && (
                            <div className="flex items-center gap-1 text-neutral-gray">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(plan.start_date)}
                                {plan.end_date && ` - ${formatDate(plan.end_date)}`}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-neutral-gray">
                            <Users className="w-4 h-4" />
                            <span>{plan.current_participants}/{plan.max_participants} participantes</span>
                          </div>
                        </div>
                        
                        {plan.description && (
                          <p className="text-sm text-neutral-gray mt-3 line-clamp-2">
                            {plan.description}
                          </p>
                        )}
                        
                        <div className="flex gap-2 mt-4">
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={`/plans/${plan.id}`}>
                              Ver Detalles
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" disabled>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plans I'm Participating In */}
          {participatingPlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Planes en los que participo ({participatingPlans.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participatingPlans.map((plan) => {
                    const typeInfo = getPlanTypeInfo(plan.plan_type);
                    
                    return (
                      <div key={plan.id} className="p-4 border-2 border-secondary rounded-lg bg-secondary/5 dark:border-secondary-light">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{typeInfo.icon}</span>
                            <h3 className="font-semibold">{plan.title}</h3>
                          </div>
                          <Badge variant="secondary">Participando</Badge>
                        </div>
                        
                        <p className="text-sm text-neutral-gray mb-2">
                          Creado por{' '}
                          <Link
                            href={`/profile/${plan.creator?.username || plan.creator_id}`}
                            className="hover:underline"
                          >
                            {plan.creator?.full_name || plan.creator?.username || 'Usuario'}
                          </Link>
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-1 text-neutral-gray">
                            <MapPin className="w-4 h-4" />
                            <span>{plan.destinations.join(", ")}</span>
                          </div>
                          
                          {plan.start_date && (
                            <div className="flex items-center gap-1 text-neutral-gray">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(plan.start_date)}
                                {plan.end_date && ` - ${formatDate(plan.end_date)}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button asChild size="sm" variant="secondary" className="flex-1">
                            <Link href={`/plans/${plan.id}`}>
                              Ver Detalles
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" disabled>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Descubrir Planes
              </CardTitle>
              <CardDescription>
                Buscá planes públicos con filtros avanzados, encontrá compañeros de
                viaje y unite a nuevas aventuras.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Search className="w-16 h-16 mx-auto text-neutral-gray mb-4" />
              <p className="text-neutral-gray mb-6">
                La nueva página de descubrimiento tiene filtros por tipo de plan,
                destino, fechas, presupuesto y más.
              </p>
              <Button asChild variant="primary" size="lg">
                <Link href="/discover">
                  <Search className="w-4 h-4" />
                  Explorar Planes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 