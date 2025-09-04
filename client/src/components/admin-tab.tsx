import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedUsersToDelete, setSelectedUsersToDelete] = useState<string[]>([]);
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

  // Clear all task logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/logs");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All task logs cleared successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear task logs. Please try again.",
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
        <div className="border border-gray-300 rounded-lg shadow-xl p-6 text-center" style={{ background: '#f8f8f8' }} data-testid="card-admin-unlock">
          <div className="mb-4">
            <i className="fas fa-lock text-4xl" style={{ color: '#0a1622' }}></i>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#0a1622' }}>Admin Access Required</h2>
          <p className="text-sm mb-6 text-gray-600">Enter the admin code to access the management panel</p>
          
          <div className="space-y-4">
            <Input 
              type="password"
              placeholder="Enter admin code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="text-center border border-gray-300 rounded"
              data-testid="input-admin-code"
              onKeyDown={(e) => e.key === "Enter" && handleUnlockAdmin()}
            />
            <Button 
              onClick={handleUnlockAdmin}
              className="w-full px-4 py-2 font-bold border-none rounded cursor-pointer transition-colors duration-200"
              style={{ background: '#2980b9', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1f6391'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2980b9'}
              data-testid="button-unlock-admin"
            >
              <i className="fas fa-unlock mr-2"></i>
              Unlock Admin Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 border border-gray-300 rounded-lg" style={{ background: '#f8f8f8' }}>
      <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#0a1622' }}>Admin Panel — Assign Tasks</h2>
      <p className="text-center text-gray-600 mb-6 text-sm">Assign tasks to each user using comma-separated values.</p>
      
      <div className="space-y-8">
        {/* Add User Section */}
        <div className="add-user-row flex flex-wrap gap-4 mb-6">
          <Input 
            placeholder="Enter full name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            data-testid="input-new-user-name"
          />
          <Input 
            placeholder="Enter project name"
            value={newUserProject}
            onChange={(e) => setNewUserProject(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            data-testid="input-new-user-project"
          />
          <Button 
            onClick={handleAddUser}
            disabled={addUserMutation.isPending}
            className="px-4 py-2 text-white border-none rounded font-bold cursor-pointer transition-colors duration-200"
            style={{ background: '#27ae60' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#219150'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#27ae60'}
            data-testid="button-add-user"
          >
            ➕ {addUserMutation.isPending ? "Adding..." : "Add User"}
          </Button>
          <Button 
            onClick={() => setDeleteMode(!deleteMode)}
            className="px-4 py-2 text-white border-none rounded font-bold cursor-pointer transition-colors duration-200"
            style={{ background: '#c0392b' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#a93226'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#c0392b'}
            data-testid="button-toggle-delete-mode"
          >
            🗑 Delete Users
          </Button>
        </div>

        {/* Delete Controls */}
        {deleteMode && (
          <div className="mb-4">
            <Button 
              onClick={() => {
                selectedUsersToDelete.forEach(userName => {
                  deleteUserMutation.mutate(userName);
                });
                setSelectedUsersToDelete([]);
                setDeleteMode(false);
              }}
              className="px-5 py-2 text-white border-none rounded font-bold cursor-pointer transition-colors duration-200"
              style={{ background: '#e67e22' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#d35400'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#e67e22'}
              data-testid="button-confirm-delete"
            >
              ✔ Confirm Delete
            </Button>
          </div>
        )}

        {/* User Management Tasks */}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="admin-task-row flex items-center justify-between gap-4 p-3 bg-white border border-gray-300 rounded shadow-sm" data-testid={`row-user-${user.id}`}>
              {deleteMode && (
                <input
                  type="checkbox"
                  className="admin-task-checkbox mr-2"
                  checked={selectedUsersToDelete.includes(user.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsersToDelete([...selectedUsersToDelete, user.name]);
                    } else {
                      setSelectedUsersToDelete(selectedUsersToDelete.filter(name => name !== user.name));
                    }
                  }}
                />
              )}
              <div className="flex-1">
                <div className="font-bold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-600">{user.project}</div>
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Tasks (comma-separated)"
                  value={selectedTaskUser === user.name ? userTasks : user.tasks.join(", ")}
                  onChange={(e) => {
                    setSelectedTaskUser(user.name);
                    setUserTasks(e.target.value);
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded bg-gray-50"
                  style={{ backgroundColor: '#f0f0f0' }}
                  data-testid={`input-tasks-${user.id}`}
                />
                <Button
                  onClick={() => handleSaveTasks()}
                  disabled={updateTasksMutation.isPending || selectedTaskUser !== user.name}
                  className="px-3 py-2 text-white border-none rounded font-bold cursor-pointer transition-colors duration-200"
                  style={{ background: '#27ae60' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#219150'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#27ae60'}
                  data-testid={`button-save-tasks-${user.id}`}
                >
                  {updateTasksMutation.isPending && selectedTaskUser === user.name ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Task Logs */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#0a1622' }}>Data Bank — Task Logs</h3>
            <div className="space-x-2">
              <Button 
                onClick={() => clearLogsMutation.mutate()}
                disabled={clearLogsMutation.isPending}
                className="px-4 py-2 text-white border-none rounded font-bold cursor-pointer transition-colors duration-200"
                style={{ background: '#c0392b' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#a93226'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#c0392b'}
                data-testid="button-clear-databank"
              >
                🗑 {clearLogsMutation.isPending ? "Clearing..." : "Clear Data Bank"}
              </Button>
              <Button 
                className="px-4 py-2 text-white border-none rounded font-bold cursor-pointer transition-colors duration-200"
                style={{ background: '#1a73e8' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#0f5bb5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a73e8'}
                data-testid="button-export-csv"
              >
                📤 Export to Excel
              </Button>
            </div>
          </div>
          <p className="text-center text-gray-600 mb-4 text-sm">This table contains all task submissions by users.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" data-testid="table-task-logs">
              <thead>
                <tr>
                  <th className="p-3 border border-gray-300 text-left font-bold text-white" style={{ background: '#0a1622', color: '#ffd600' }}>User</th>
                  <th className="p-3 border border-gray-300 text-left font-bold text-white" style={{ background: '#0a1622', color: '#ffd600' }}>Project</th>
                  <th className="p-3 border border-gray-300 text-left font-bold text-white" style={{ background: '#0a1622', color: '#ffd600' }}>Task</th>
                  <th className="p-3 border border-gray-300 text-left font-bold text-white" style={{ background: '#0a1622', color: '#ffd600' }}>Status</th>
                  <th className="p-3 border border-gray-300 text-left font-bold text-white" style={{ background: '#0a1622', color: '#ffd600' }}>Timestamp</th>
                  <th className="p-3 border border-gray-300 text-left font-bold text-white" style={{ background: '#0a1622', color: '#ffd600' }}>Comment</th>
                </tr>
              </thead>
              <tbody>
                {taskLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-gray-500 border border-gray-300">
                      No task logs found
                    </td>
                  </tr>
                ) : (
                  taskLogs.map((log) => {
                    const user = users.find(u => u.name === log.user);
                    return (
                      <tr key={log.id} data-testid={`row-task-log-${log.id}`}>
                        <td className="p-3 border border-gray-300">{log.user}</td>
                        <td className="p-3 border border-gray-300">{user?.project || "Unknown"}</td>
                        <td className="p-3 border border-gray-300">{log.task}</td>
                        <td className="p-3 border border-gray-300">{log.status}</td>
                        <td className="p-3 border border-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 border border-gray-300">{log.comment || ""}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}