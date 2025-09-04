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
      <h1 className="text-4xl font-bold text-center mb-12 uppercase tracking-wide drop-shadow-lg" style={{ color: '#0a1622' }}>User Entries</h1>
      
      <div className="entry-grid grid grid-cols-2 gap-6 items-center mb-12 max-w-4xl mx-auto px-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* STEP 1 */}
        <div className="step-label text-center py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 1</div>
        <div className="step-action py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>SELECT USER →</div>
        
        <div className="step-input col-span-2">
          <Select value={selectedUser} onValueChange={setSelectedUser} disabled={usersLoading}>
            <SelectTrigger data-testid="select-user" className="w-full font-bold border-2 border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-400" style={{ background: '#a8e063', padding: '0.75rem 1rem' }}>
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
        <div className="project-label text-center py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>PROJECT</div>
        <div className="project-name py-3 px-4 font-bold text-center text-white border-2 border-red-600 mb-6 rounded-xl shadow-lg transform transition-all duration-200 hover:shadow-xl" style={{ background: 'red' }} data-testid="text-user-project">
          {selectedUserData?.project || "---"}
        </div>

        {/* STEP 2 */}
        <div className="step-label text-center py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 2</div>
        <div className="step-action py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>SELECT TASK →</div>
        
        <div className="step-input col-span-2">
          <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedUser}>
            <SelectTrigger data-testid="select-task" className="w-full font-bold border-2 border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-400" style={{ background: '#a8e063', padding: '0.75rem 1rem' }}>
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
        <div className="step-label text-center py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 3</div>
        <div className="step-action py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>TASK STATUS →</div>
        
        <div className="step-input col-span-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger data-testid="select-status" className="w-full font-bold border-2 border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-400" style={{ background: '#a8e063', padding: '0.75rem 1rem' }}>
              <SelectValue placeholder="— choose status —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT COMPLETED">NOT COMPLETED</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* STEP 4 */}
        <div className="step-label text-center py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 4</div>
        <div className="step-action py-3 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style={{ background: '#0a1622', color: '#ffd600' }}>OPTIONAL COMMENT →</div>
        
        <div className="step-input col-span-2">
          <Textarea
            placeholder=""
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-12 p-3 border-2 border-gray-300 rounded-xl bg-white resize-none font-inherit shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            style={{ fontSize: '1rem' }}
            data-testid="textarea-comment"
          />
        </div>
      </div>

      <div className="submit-wrapper flex justify-center mt-12 mb-16">
        <Button 
          onClick={handleSubmitEntry}
          disabled={!selectedUser || !selectedTask || !selectedStatus || submitTaskMutation.isPending}
          className="px-12 py-5 text-xl font-bold border-none rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ background: '#0a1622', color: '#ffd600' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#142f4e'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#0a1622'}
          data-testid="button-submit-entry"
        >
          {submitTaskMutation.isPending ? "SUBMITTING..." : "SUBMIT ENTRY"}
        </Button>
      </div>
    </div>
  );
}