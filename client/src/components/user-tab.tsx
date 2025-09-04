import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, TaskLog } from "@shared/schema";

export default function UserTab() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get selected user data
  const selectedUserData = users.find(user => user.name === selectedUser);

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: async ({ user, task, status, comment }: { user: string; task: string; status: string; comment?: string }) => {
      return apiRequest("POST", "/api/logs", { user, task, status, comment: comment || null });
    },
    onSuccess: () => {
      toast({
        title: "Entry Submitted",
        description: "Your task entry has been logged successfully.",
      });
      setSelectedTask("");
      setSelectedStatus("");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitEntry = () => {
    if (!selectedUser || !selectedTask || !selectedStatus) {
      toast({
        title: "Validation Error",
        description: "Please complete all required steps (user, task, and status).",
        variant: "destructive",
      });
      return;
    }

    submitTaskMutation.mutate({ 
      user: selectedUser, 
      task: selectedTask, 
      status: selectedStatus,
      comment: comment.trim() || undefined
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">User Entries</h1>
      
      <div className="entry-grid grid grid-cols-3 gap-4 items-center mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg border border-blue-200">
        {/* STEP 1 */}
        <div className="step-label text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">STEP 1</div>
        <div className="step-action text-sm font-semibold text-blue-700">SELECT USER →</div>
        <div className="step-input">
          <Select value={selectedUser} onValueChange={setSelectedUser} disabled={usersLoading}>
            <SelectTrigger data-testid="select-user" className="w-full">
              <SelectValue placeholder="— choose user —" />
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

        {/* PROJECT display */}
        <div className="project-label text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">PROJECT</div>
        <div className="project-name text-sm font-semibold col-span-2 text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200" data-testid="text-user-project">
          {selectedUserData?.project || "---"}
        </div>

        {/* STEP 2 */}
        <div className="step-label text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">STEP 2</div>
        <div className="step-action text-sm font-semibold text-purple-700">SELECT TASK →</div>
        <div className="step-input">
          <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedUser}>
            <SelectTrigger data-testid="select-task" className="w-full">
              <SelectValue placeholder="— choose task —" />
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

        {/* STEP 3 */}
        <div className="step-label text-sm font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">STEP 3</div>
        <div className="step-action text-sm font-semibold text-orange-700">TASK STATUS →</div>
        <div className="step-input">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger data-testid="select-status" className="w-full">
              <SelectValue placeholder="— choose status —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT COMPLETED">NOT COMPLETED</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* STEP 4 */}
        <div className="step-label text-sm font-bold text-pink-600 bg-pink-100 px-2 py-1 rounded">STEP 4</div>
        <div className="step-action text-sm font-semibold text-pink-700">OPTIONAL COMMENT →</div>
        <div className="step-input">
          <Textarea
            placeholder=""
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
            data-testid="textarea-comment"
          />
        </div>
      </div>

      <div className="submit-wrapper text-center">
        <Button 
          onClick={handleSubmitEntry}
          disabled={!selectedUser || !selectedTask || !selectedStatus || submitTaskMutation.isPending}
          className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
          data-testid="button-submit-entry"
        >
          {submitTaskMutation.isPending ? "SUBMITTING..." : "SUBMIT ENTRY"}
        </Button>
      </div>
    </div>
  );
}