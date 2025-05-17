
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, UserPlus, User as UserIcon } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const AdminUsers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => authAPI.getAllUsers().then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading users",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter and search users
  const filteredUsers = users?.filter((user: any) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all registered users in the system
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
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-secondary/20 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
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
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === "admin" ? (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => window.location.href = `/admin/users/${user.id}`}>
                            View
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-semibold mb-1">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "There are no users in the system yet"}
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
