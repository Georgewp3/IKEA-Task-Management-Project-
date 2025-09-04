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
    <div className="max-w-5xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Task Submission Dashboard
        </h1>
        <p className="text-slate-600 text-lg">Complete your tasks efficiently with our step-by-step workflow</p>
      </div>
      
      {/* Steps Container */}
      <div className="grid gap-8 mb-10">
        {/* STEP 1 - User Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              1
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">Select User</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <Select value={selectedUser} onValueChange={setSelectedUser} disabled={usersLoading}>
                <SelectTrigger data-testid="select-user" className="h-14 text-lg font-medium border-2 border-slate-300 hover:border-blue-400 transition-colors rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name} className="text-lg py-3">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">ASSIGNED PROJECT</label>
              <div className="text-xl font-bold text-slate-800" data-testid="text-user-project">
                {selectedUserData?.project || "No project assigned"}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2 - Task Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              2
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">Select Task</h3>
          </div>
          <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedUser}>
            <SelectTrigger data-testid="select-task" className="h-14 text-lg font-medium border-2 border-slate-300 hover:border-green-400 transition-colors rounded-xl bg-gradient-to-r from-green-50 to-green-100">
              <SelectValue placeholder={!selectedUser ? "Select a user first..." : "Choose a task..."} />
            </SelectTrigger>
            <SelectContent>
              {selectedUserData?.tasks.map((task) => (
                <SelectItem key={task} value={task} className="text-lg py-3">
                  {task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* STEP 3 - Status Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              3
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">Task Status</h3>
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger data-testid="select-status" className="h-14 text-lg font-medium border-2 border-slate-300 hover:border-orange-400 transition-colors rounded-xl bg-gradient-to-r from-orange-50 to-orange-100">
              <SelectValue placeholder="Choose completion status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPLETED" className="text-lg py-3">
                ✅ COMPLETED
              </SelectItem>
              <SelectItem value="NOT COMPLETED" className="text-lg py-3">
                ⏳ NOT COMPLETED
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* STEP 4 - Optional Comment */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              4
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">Add Comment</h3>
            <span className="ml-3 px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-medium">Optional</span>
          </div>
          <Textarea
            placeholder="Add any notes, observations, or details about your task completion..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-24 p-4 text-lg border-2 border-slate-300 hover:border-purple-400 focus:border-purple-500 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 resize-none transition-colors"
            data-testid="textarea-comment"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mb-16">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-1 rounded-3xl shadow-2xl">
          <Button 
            onClick={handleSubmitEntry}
            disabled={!selectedUser || !selectedTask || !selectedStatus || submitTaskMutation.isPending}
            className="px-16 py-8 text-2xl font-bold rounded-3xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-xl hover:shadow-2xl border-4 border-yellow-400"
            style={{ 
              background: !selectedUser || !selectedTask || !selectedStatus 
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' 
                : 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
              color: '#ffffff',
              borderColor: '#fbbf24',
              minWidth: '280px',
              minHeight: '80px'
            }}
            data-testid="button-submit-entry"
          >
            {submitTaskMutation.isPending ? (
              <>
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                <span className="text-2xl">SUBMITTING...</span>
              </>
            ) : (
              <>
                <span className="text-3xl mr-3">🚀</span>
                <span className="text-2xl tracking-wide">SUBMIT ENTRY</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}