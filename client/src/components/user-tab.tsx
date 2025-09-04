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
      <h1 className="text-3xl font-bold text-center mb-8 uppercase" style={{ color: '#0a1622' }}>User Entries</h1>
      
      <div className="entry-grid grid grid-cols-2 gap-4 items-center mb-8 max-w-4xl mx-auto px-4">
        {/* STEP 1 */}
        <div className="step-label text-center py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 1</div>
        <div className="step-action py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>SELECT USER →</div>
        
        <div className="step-input col-span-2">
          <Select value={selectedUser} onValueChange={setSelectedUser} disabled={usersLoading}>
            <SelectTrigger data-testid="select-user" className="w-full font-bold border border-black" style={{ background: '#a8e063', padding: '0.6rem 0.75rem' }}>
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
        <div className="project-label text-center py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>PROJECT</div>
        <div className="project-name py-2 px-4 font-bold text-center text-white border border-black mb-4" style={{ background: 'red' }} data-testid="text-user-project">
          {selectedUserData?.project || "---"}
        </div>

        {/* STEP 2 */}
        <div className="step-label text-center py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 2</div>
        <div className="step-action py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>SELECT TASK →</div>
        
        <div className="step-input col-span-2">
          <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedUser}>
            <SelectTrigger data-testid="select-task" className="w-full font-bold border border-black" style={{ background: '#a8e063', padding: '0.6rem 0.75rem' }}>
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
        <div className="step-label text-center py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 3</div>
        <div className="step-action py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>TASK STATUS →</div>
        
        <div className="step-input col-span-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger data-testid="select-status" className="w-full font-bold border border-black" style={{ background: '#a8e063', padding: '0.6rem 0.75rem' }}>
              <SelectValue placeholder="— choose status —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT COMPLETED">NOT COMPLETED</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* STEP 4 */}
        <div className="step-label text-center py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>STEP 4</div>
        <div className="step-action py-2 font-bold" style={{ background: '#0a1622', color: '#ffd600' }}>OPTIONAL COMMENT →</div>
        
        <div className="step-input col-span-2">
          <Textarea
            placeholder=""
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-10 p-2 border border-gray-300 rounded bg-white resize-none font-inherit"
            style={{ fontSize: '1rem' }}
            data-testid="textarea-comment"
          />
        </div>
      </div>

      <div className="submit-wrapper flex justify-center mt-8 mb-12">
        <Button 
          onClick={handleSubmitEntry}
          disabled={!selectedUser || !selectedTask || !selectedStatus || submitTaskMutation.isPending}
          className="px-8 py-4 text-lg font-bold border-none rounded-lg cursor-pointer transition-colors duration-200"
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