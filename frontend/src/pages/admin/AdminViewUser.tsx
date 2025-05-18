import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  UserCircle,
    Shield,
    LucideCalendarCog,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { authAPI, User as UserType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const AdminViewUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const queryEnabled =
    !!userId && userId !== "undefined" && userId.trim() !== "";

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<UserType, Error>({
    queryKey: ["adminViewUser", userId],
    queryFn: async () => {
      if (!userId || !queryEnabled) {
        throw new Error("User ID is required to fetch details.");
      }
      // Use the actual API function
      return authAPI.adminGetUserById(userId).then((res) => res.data);
    },
    enabled: queryEnabled,
    retry: 1,
  });

  useEffect(() => {
    if (isError && error && queryEnabled) {
      toast({
        title: "Error Loading User",
        description: error.message || "Could not fetch user details.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast, queryEnabled]);

  if (!userId || (!queryEnabled && !isLoading)) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Invalid User ID</h2>
          <p className="mt-2 text-muted-foreground">
            The user ID is missing or invalid in the URL.
          </p>
          <Button onClick={() => navigate("/admin/users")} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 flex justify-center items-center h-full">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !user) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">User Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            {error?.message || "The requested user could not be found."}
          </p>
          <Button onClick={() => navigate("/admin/users")} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
        </Button>
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-16 w-16 text-primary" />
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription>User ID: {user.id}</CardDescription>
              <Badge
                variant={user.role === "admin" ? "destructive" : "secondary"}
                className="mt-1"
              >
                <Shield className="mr-1 h-3 w-3" /> {user.role?.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">
              User Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone || "Not Provided"}</p>
                </div>
              </div>
              <div className="flex items-center md:col-span-2">
                <LucideCalendarCog className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined On</p>
                  <p className="font-medium">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-medium p-3 bg-muted rounded-md min-h-[40px]">
                  {user.address || "Not Provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminViewUser;
