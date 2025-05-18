import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { settingsAPI, AppSettings } from "@/lib/api";
import { Loader2 } from "lucide-react";

const settingsFormSchema = z.object({
  siteName: z
    .string()
    .min(3, "Site name must be at least 3 characters.")
    .max(50, "Site name too long."),
  maintenanceMode: z.boolean(),
  recordsPerPage: z.coerce
    .number()
    .min(5, "Min 5 records.")
    .max(50, "Max 50 records."),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

const AdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: currentSettings,
    isLoading: isLoadingSettings,
    isError,
    error,
  } = useQuery<AppSettings, Error>({
    queryKey: ["appSettings"],
    queryFn: () => settingsAPI.getSettings().then((res) => res.data),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      siteName: "",
      maintenanceMode: false,
      recordsPerPage: 10,
    },
  });

  useEffect(() => {
    if (currentSettings) {
      reset({
        siteName: currentSettings.siteName,
        maintenanceMode: currentSettings.maintenanceMode,
        recordsPerPage: currentSettings.recordsPerPage,
      });
    }
  }, [currentSettings, reset]);

  const mutation = useMutation({
    mutationFn: (data: SettingsFormData) => settingsAPI.updateSettings(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["appSettings"], updatedData.data);
      toast({
        title: "Settings Updated",
        description: "System settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    mutation.mutate(data);
  };

  if (isLoadingSettings) {
    return (
      <MainLayout>
        <div className="p-8 flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-red-600">
          Error loading settings: {error?.message}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage general settings for the application.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Modify application-wide configurations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  {...register("siteName")}
                  placeholder="e.g., Awesome Insurance Co."
                />
                {errors.siteName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.siteName.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode" className="text-base">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily make the site unavailable to non-admin users.
                  </p>
                </div>
                <Controller
                  name="maintenanceMode"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="maintenanceMode"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              {errors.maintenanceMode && (
                <p className="text-sm text-destructive mt-1">
                  {errors.maintenanceMode.message}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="recordsPerPage">Default Records Per Page</Label>
                <Input
                  id="recordsPerPage"
                  type="number"
                  {...register("recordsPerPage")}
                  placeholder="10"
                />
                <p className="text-sm text-muted-foreground">
                  Set default number of items shown in tables (e.g., policies,
                  claims list). Min 5, Max 50.
                </p>
                {errors.recordsPerPage && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.recordsPerPage.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={mutation.isPending || !isDirty}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default AdminSettings;
