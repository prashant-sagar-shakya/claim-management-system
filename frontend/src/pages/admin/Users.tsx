import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  User as UserIconLucide,
  Trash2,
  Edit3,
  Eye,
  Loader2,
} from "lucide-react"; // Renamed UserIcon
import { authAPI, User as UserType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context"; // For checking current user

const AdminUsers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: loggedInUser } = useAuth(); // Get currently logged in admin
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserType[], Error>({
    queryKey: ["allAdminUsers"],
    queryFn: () => authAPI.getAllUsers().then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading users",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => authAPI.adminDeleteUser(userId),
    onSuccess: (data, variables) => {
      toast({
        title: "User Deleted",
        description: data.data.message || `User has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["allAdminUsers"] });
      setUserToDelete(null);
    },
    onError: (error: Error, variables) => {
      toast({
        title: "Delete Failed",
        description:
          (error as any).response?.data?.message ||
          error.message ||
          `Could not delete user.`,
        variant: "destructive",
      });
      setUserToDelete(null);
    },
  });

  const handleDeleteUser = () => {
    if (userToDelete && loggedInUser && userToDelete.id === loggedInUser.id) {
      toast({
        title: "Action Denied",
        description: "You cannot delete your own admin account.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const filteredUsers =
    users?.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 flex justify-center items-center h-full">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete User: {userToDelete?.firstName} {userToDelete?.lastName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" /> Add User (Soon)
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Registered Users</CardTitle>
            <CardDescription>
              View, edit, or manage users in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredUsers.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: UserType) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === "admin" ? (
                            <Badge
                              variant="outline"
                              className="border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                            >
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            title="View User Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            title="Edit User (Soon)"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                            onClick={() => setUserToDelete(user)}
                            title="Delete User"
                            disabled={
                              (deleteUserMutation.isPending &&
                                deleteUserMutation.variables === user.id) ||
                              user.id === loggedInUser?.id
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserIconLucide className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-semibold mb-1">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : users && users.length === 0
                    ? "There are no users in the system yet."
                    : "No users matching your criteria."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminUsers;
