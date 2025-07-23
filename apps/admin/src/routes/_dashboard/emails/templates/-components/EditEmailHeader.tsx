import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label } from "@tribe-nest/frontend-shared";
import { Tooltip2 } from "@tribe-nest/frontend-shared";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, Monitor, Smartphone, Save, Undo, Redo, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useEditor } from "@craftjs/core";
import { useSendTestEmail } from "@/hooks/mutations/useEmails";
import type { ApiError } from "@tribe-nest/frontend-shared";

export const EditEmailHeader = ({
  isMobile,
  setIsMobile,
  onSaveTemplate,
  templateId,
}: {
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  onSaveTemplate: (content: string) => void;
  templateId: string;
}) => {
  const navigate = useNavigate();
  const router = useRouter();
  const { query, canUndo, canRedo, actions } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const { currentProfileAuthorization } = useAuth();
  const sendTestEmail = useSendTestEmail();

  // Test email dialog state
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  if (!currentProfileAuthorization) {
    return null;
  }

  const handleSaveClick = async () => {
    const serializedNodes = query.getSerializedNodes();
    onSaveTemplate(JSON.stringify(serializedNodes));
  };

  const validateTestEmailForm = () => {
    let isValid = true;

    // Validate email
    if (!testEmail.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validate subject
    if (!testSubject.trim()) {
      setSubjectError("Subject is required");
      isValid = false;
    } else {
      setSubjectError("");
    }

    return isValid;
  };

  const handleSendTestEmail = async () => {
    if (!validateTestEmailForm()) {
      return;
    }

    if (!currentProfileAuthorization?.profileId) {
      toast.error("Profile not found");
      return;
    }

    try {
      await sendTestEmail.mutateAsync({
        templateId,
        recipientEmail: testEmail.trim(),
        subject: testSubject.trim(),
        profileId: currentProfileAuthorization.profileId,
      });
      toast.success("Test email sent successfully");
      setIsTestEmailDialogOpen(false);
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || "Failed to send test email");
    }
  };

  const openTestEmailDialog = () => {
    setIsTestEmailDialogOpen(true);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 z-[100000] bg-background">
      <div className="flex items-center gap-2">
        <Tooltip2 text="Back">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (router.history.canGoBack()) {
                router.history.back();
              } else {
                navigate({ to: "/emails/templates" });
              }
            }}
          >
            <ArrowLeftIcon className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* <UpdateStylesDialog theme={themeSettings} setTheme={setThemeSettings} /> */}
          <Tooltip2 text="Undo">
            <Button size="icon" variant="outline" disabled={!canUndo} onClick={() => actions.history.undo()}>
              <Undo className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
          <Tooltip2 text="Redo">
            <Button size="icon" variant="outline" disabled={!canRedo} onClick={() => actions.history.redo()}>
              <Redo className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip2 text="Desktop">
            <Button size="icon" variant={isMobile ? "link" : "outline"} onClick={() => setIsMobile(false)}>
              <Monitor className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
          <Tooltip2 text="Mobile">
            <Button size="icon" variant={isMobile ? "outline" : "link"} onClick={() => setIsMobile(true)}>
              <Smartphone className="w-4 h-4 text-foreground" />
            </Button>
          </Tooltip2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip2 text="Send Test Email">
          <Button onClick={openTestEmailDialog}>
            <Send className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
        <Tooltip2 text="Save the website version">
          <Button onClick={handleSaveClick}>
            <Save className="w-4 h-4 text-foreground" />
          </Button>
        </Tooltip2>
      </div>

      {/* Send Test Email Dialog */}
      <Dialog open={isTestEmailDialogOpen} onOpenChange={setIsTestEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Recipient Email *</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="Enter email address..."
                value={testEmail}
                onChange={(e) => {
                  setTestEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="testSubject">Subject *</Label>
              <Input
                id="testSubject"
                placeholder="Enter email subject..."
                value={testSubject}
                onChange={(e) => {
                  setTestSubject(e.target.value);
                  if (subjectError) setSubjectError("");
                }}
                className={subjectError ? "border-red-500" : ""}
              />
              {subjectError && <p className="text-sm text-red-500">{subjectError}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTestEmailDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSendTestEmail} className="flex-1" disabled={sendTestEmail.isPending}>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
