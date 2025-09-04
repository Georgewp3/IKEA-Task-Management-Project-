import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, TaskLog } from "@shared/schema";

export default function UserTab() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [notCompletedReason, setNotCompletedReason] = useState("");
  const [isNotCompletedDialogOpen, setIsNotCompletedDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get selected user data
  const selectedUserData = users.find(user => user.name === selectedUser);

  // Fetch user's task logs
  const { data: userLogs = [] } = useQuery<TaskLog[]>({
    queryKey: ["/api/logs"],
    select: (logs) => logs.filter(log => log.user === selectedUser),
    enabled: !!selectedUser,
  });

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: async ({ user, task }: { user: string; task: string }) => {
      return apiRequest("POST", "/api/logs", { user, task });
    },
    onSuccess: () => {
      toast({
        title: "Task Submitted",
        description: "Your task has been logged successfully.",
      });
      setSelectedTask("");
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit task not completed mutation
  const submitNotCompletedMutation = useMutation({
    mutationFn: async ({ user, task, reason }: { user: string; task: string; reason?: string }) => {
      const taskName = reason ? `${task} - Not Completed: ${reason}` : `${task} - Not Completed`;
      return apiRequest("POST", "/api/logs", { user, task: taskName });
    },
    onSuccess: () => {
      toast({
        title: "Task Not Completed Reported",
        description: "Your report has been logged successfully.",
      });
      setSelectedTask("");
      setNotCompletedReason("");
      setIsNotCompletedDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report incomplete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitTask = () => {
    if (!selectedUser || !selectedTask) {
      toast({
        title: "Validation Error",
        description: "Please select both a user and a task.",
        variant: "destructive",
      });
      return;
    }

    submitTaskMutation.mutate({ user: selectedUser, task: selectedTask });
  };

  const handleSubmitNotCompleted = () => {
    if (!selectedUser || !selectedTask) {
      toast({
        title: "Validation Error",
        description: "Please select both a user and a task.",
        variant: "destructive",
      });
      return;
    }

    submitNotCompletedMutation.mutate({ 
      user: selectedUser, 
      task: selectedTask, 
      reason: notCompletedReason.trim() || undefined 
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Selection Card */}
        <Card data-testid="card-user-selection">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-user-circle text-primary mr-3 text-xl"></i>
              Select User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="userSelect" className="block text-sm font-medium text-foreground mb-2">
                Your Name
              </label>
              <Select value={selectedUser} onValueChange={setSelectedUser} disabled={usersLoading}>
                <SelectTrigger data-testid="select-user">
                  <SelectValue placeholder={usersLoading ? "Loading..." : "Select your name..."} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Assigned Project
              </label>
              <div className="flex items-center px-3 py-2 border border-border rounded-md bg-muted">
                <i className="fas fa-project-diagram text-muted-foreground mr-2"></i>
                <span className="text-sm text-muted-foreground">PROJECT: </span>
                <span data-testid="text-user-project" className="ml-1 font-medium text-foreground">
                  {selectedUserData?.project || "No project assigned"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Submission Card */}
        <Card data-testid="card-task-submission">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-clipboard-list text-accent mr-3 text-xl"></i>
              Submit Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Available Tasks
              </label>
              <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedUser}>
                <SelectTrigger data-testid="select-task">
                  <SelectValue placeholder="Select a task..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedUserData?.tasks.map((task) => (
                    <SelectItem key={task} value={task}>
                      {task}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleSubmitTask}
                disabled={!selectedUser || !selectedTask || submitTaskMutation.isPending}
                className="w-full"
                data-testid="button-submit-task"
              >
                <i className="fas fa-check mr-2"></i>
                {submitTaskMutation.isPending ? "Submitting..." : "Submit Task"}
              </Button>

              <Dialog open={isNotCompletedDialogOpen} onOpenChange={setIsNotCompletedDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    disabled={!selectedUser || !selectedTask}
                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                    data-testid="button-task-not-completed"
                  >
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Task Not Completed
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-not-completed">
                  <DialogHeader>
                    <DialogTitle>Report Task Not Completed</DialogTitle>
                    <DialogDescription>
                      Report that you couldn't complete the task "{selectedTask}". You can optionally provide a reason.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Reason (Optional)
                      </label>
                      <Textarea
                        placeholder="Why couldn't you complete this task? (optional)"
                        value={notCompletedReason}
                        onChange={(e) => setNotCompletedReason(e.target.value)}
                        rows={3}
                        className="resize-none"
                        data-testid="textarea-not-completed-reason"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsNotCompletedDialogOpen(false);
                        setNotCompletedReason("");
                      }}
                      data-testid="button-cancel-not-completed"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitNotCompleted}
                      disabled={submitNotCompletedMutation.isPending}
                      data-testid="button-submit-not-completed"
                    >
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      {submitNotCompletedMutation.isPending ? "Reporting..." : "Report Not Completed"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      {selectedUser && (
        <Card data-testid="card-recent-submissions">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-history text-secondary mr-3 text-xl"></i>
              Your Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Task</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 px-4 text-center text-muted-foreground">
                        No submissions yet
                      </td>
                    </tr>
                  ) : (
                    userLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50" data-testid={`row-log-${log.id}`}>
                        <td className="py-3 px-4 text-foreground">{log.task}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
