import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, TaskLog } from "@shared/schema";

interface AdminTabProps {
  isUnlocked: boolean;
  onUnlock: () => void;
}

export default function AdminTab({ isUnlocked, onUnlock }: AdminTabProps) {
  const [adminCode, setAdminCode] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserProject, setNewUserProject] = useState("");
  const [selectedTaskUser, setSelectedTaskUser] = useState("");
  const [userTasks, setUserTasks] = useState("");
  const { toast } = useToast();

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isUnlocked,
  });

  // Fetch task logs
  const { data: taskLogs = [] } = useQuery<TaskLog[]>({
    queryKey: ["/api/logs"],
    enabled: isUnlocked,
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: { name: string; project: string; tasks: string[] }) => {
      return apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User added successfully.",
      });
      setNewUserName("");
      setNewUserProject("");
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userName: string) => {
      return apiRequest("DELETE", `/api/users/${encodeURIComponent(userName)}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update tasks mutation
  const updateTasksMutation = useMutation({
    mutationFn: async ({ user, tasks }: { user: string; tasks: string[] }) => {
      return apiRequest("POST", `/api/tasks/${encodeURIComponent(user)}`, { tasks });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tasks updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUnlockAdmin = () => {
    if (adminCode === "332133") {
      onUnlock();
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect admin code.",
        variant: "destructive",
      });
      setAdminCode("");
    }
  };

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserProject.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both name and project fields.",
        variant: "destructive",
      });
      return;
    }

    addUserMutation.mutate({
      name: newUserName.trim(),
      project: newUserProject.trim(),
      tasks: [],
    });
  };

  const handleSaveTasks = () => {
    if (!selectedTaskUser) {
      toast({
        title: "Validation Error",
        description: "Please select a user first.",
        variant: "destructive",
      });
      return;
    }

    const tasks = userTasks
      .split(",")
      .map(task => task.trim())
      .filter(task => task.length > 0);

    updateTasksMutation.mutate({ user: selectedTaskUser, tasks });
  };

  const handleClearTasks = () => {
    if (!selectedTaskUser) {
      toast({
        title: "Validation Error",
        description: "Please select a user first.",
        variant: "destructive",
      });
      return;
    }

    updateTasksMutation.mutate({ user: selectedTaskUser, tasks: [] });
    setUserTasks("");
  };

  const handleUserTaskSelection = (userName: string) => {
    setSelectedTaskUser(userName);
    const user = users.find(u => u.name === userName);
    setUserTasks(user?.tasks.join(", ") || "");
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto">
        <Card data-testid="card-admin-unlock">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <i className="fas fa-lock text-4xl text-muted-foreground"></i>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Admin Access Required</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter the admin code to access the management panel</p>
            
            <div className="space-y-4">
              <Input 
                type="password"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="text-center"
                data-testid="input-admin-code"
                onKeyDown={(e) => e.key === "Enter" && handleUnlockAdmin()}
              />
              <Button 
                onClick={handleUnlockAdmin}
                className="w-full"
                data-testid="button-unlock-admin"
              >
                <i className="fas fa-unlock mr-2"></i>
                Unlock Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="space-y-6">
          <Card data-testid="card-user-management">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-users text-primary mr-3 text-xl"></i>
                  Manage Users
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add User Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    placeholder="User name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    data-testid="input-new-user-name"
                  />
                  <Input 
                    placeholder="Project name"
                    value={newUserProject}
                    onChange={(e) => setNewUserProject(e.target.value)}
                    data-testid="input-new-user-project"
                  />
                </div>
                <Button 
                  onClick={handleAddUser}
                  disabled={addUserMutation.isPending}
                  className="w-full"
                  data-testid="button-add-user"
                >
                  <i className="fas fa-plus mr-2"></i>
                  {addUserMutation.isPending ? "Adding..." : "Add User"}
                </Button>
              </div>
              
              {/* Users List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Users</h3>
                {users.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-md" data-testid={`row-user-${user.id}`}>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.project}</div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80">
                            <i className="fas fa-trash"></i>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteUserMutation.mutate(user.name)}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Management */}
        <div className="space-y-6">
          <Card data-testid="card-task-management">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-tasks text-accent mr-3 text-xl"></i>
                Manage Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedTaskUser} onValueChange={handleUserTaskSelection}>
                <SelectTrigger data-testid="select-task-user">
                  <SelectValue placeholder="Select user to manage tasks..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Textarea 
                placeholder="Enter tasks (comma-separated)"
                value={userTasks}
                onChange={(e) => setUserTasks(e.target.value)}
                rows={4}
                className="resize-none"
                data-testid="textarea-user-tasks"
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveTasks}
                  disabled={updateTasksMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-tasks"
                >
                  <i className="fas fa-save mr-2"></i>
                  {updateTasksMutation.isPending ? "Saving..." : "Save Tasks"}
                </Button>
                <Button 
                  onClick={handleClearTasks}
                  disabled={updateTasksMutation.isPending}
                  variant="secondary"
                  className="flex-1"
                  data-testid="button-clear-tasks"
                >
                  <i className="fas fa-eraser mr-2"></i>
                  Clear Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Logs */}
      <Card data-testid="card-task-logs">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-clipboard-list text-secondary mr-3 text-xl"></i>
              Task Logs
            </div>
            <div className="text-sm text-muted-foreground">
              <span data-testid="text-total-submissions">{taskLogs.length}</span> total submissions
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Task</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Project</th>
                </tr>
              </thead>
              <tbody>
                {taskLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-muted-foreground">
                      No task logs found
                    </td>
                  </tr>
                ) : (
                  taskLogs.map((log) => {
                    const user = users.find(u => u.name === log.user);
                    const initials = log.user.split(' ').map(n => n[0]).join('').toUpperCase();
                    
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50" data-testid={`row-task-log-${log.id}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {initials}
                            </div>
                            <span className="font-medium text-foreground">{log.user}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{log.task}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{user?.project || "Unknown"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
