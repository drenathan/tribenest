import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "./-components/layout/page-header";
import { useAuth } from "@/hooks/useAuth";
import { useGetProfileOnboarding } from "@/hooks/queries/useGetProfileAuthorizations";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
} from "@tribe-nest/frontend-shared";
import {
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Settings,
  Mail,
  CreditCard,
  MapPin,
  Users,
  Globe,
  Smartphone,
  FileText,
  Music,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { type ProfileOnboarding, ProfileOnboardingStepId } from "@/types/auth";
import Loading from "@/components/loading";

export const Route = createFileRoute("/_dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const { data: onboarding } = useGetProfileOnboarding(currentProfileAuthorization?.profile.id);
  const navigate = useNavigate();

  if (!onboarding) {
    return <Loading />;
  }

  const completedSteps = onboarding.filter((step) => step.completedAt).length;
  const totalSteps = onboarding.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepIcon = (stepId: ProfileOnboardingStepId) => {
    const iconMap: Record<ProfileOnboardingStepId, React.ReactNode> = {
      [ProfileOnboardingStepId.FileStorage]: <Settings className="w-5 h-5" />,
      [ProfileOnboardingStepId.EmailConfiguration]: <Mail className="w-5 h-5" />,
      [ProfileOnboardingStepId.PaymentConfiguration]: <CreditCard className="w-5 h-5" />,
      [ProfileOnboardingStepId.ProfileAddress]: <MapPin className="w-5 h-5" />,
      [ProfileOnboardingStepId.MembershipTier]: <Users className="w-5 h-5" />,
      [ProfileOnboardingStepId.WebsiteConfiguration]: <Globe className="w-5 h-5" />,
      [ProfileOnboardingStepId.PWAConfiguration]: <Smartphone className="w-5 h-5" />,
      [ProfileOnboardingStepId.CreateFirstPost]: <FileText className="w-5 h-5" />,
      [ProfileOnboardingStepId.UploadFirstMusic]: <Music className="w-5 h-5" />,
    };
    return iconMap[stepId] || <Settings className="w-5 h-5" />;
  };

  const handleStepAction = (step: ProfileOnboarding) => {
    if (step.actionPath.startsWith("/")) {
      navigate({ to: step.actionPath });
    } else {
      window.open(step.actionPath, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Welcome" />

      {completedSteps === totalSteps ? (
        <Card className="">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mb-4 text-green-300">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">🎉 Setup Complete!</h3>
            <p className="">
              Your profile is fully configured and ready to go. Start creating amazing content for your audience!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">Setup Progress</h3>
                <p className="text-sm text-primary/70">
                  {completedSteps} of {totalSteps} steps completed
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {Math.round(progressPercentage)}% Complete
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-primary/20" />
          </CardContent>
        </Card>
      )}

      {/* Onboarding Steps */}
      <div className="grid gap-6">
        {onboarding.map((step, index) => {
          const isCompleted = !!step.completedAt;
          const isNextStep = !isCompleted && onboarding.slice(0, index).every((s) => s.completedAt);

          return (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < onboarding.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-green-400 to-primary dark:from-green-500 dark:to-primary" />
              )}

              <Card
                className={`transition-all duration-300 hover:shadow-lg ${
                  isCompleted
                    ? ""
                    : isNextStep
                      ? "border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10 ring-2 ring-primary/20 dark:ring-primary/30"
                      : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400"
                            : isNextStep
                              ? "bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary"
                              : "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <div className="text-gray-600 dark:text-gray-400">{getStepIcon(step.id)}</div>
                        )}
                        {isNextStep && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle
                            className={`text-lg ${
                              isCompleted
                                ? "text-green-800 dark:text-green-200"
                                : isNextStep
                                  ? "text-primary dark:text-primary"
                                  : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {step.title}
                          </CardTitle>
                          {isCompleted && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              Completed
                            </Badge>
                          )}
                          {isNextStep && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 animate-pulse"
                            >
                              Next Step
                            </Badge>
                          )}
                        </div>
                        <CardDescription
                          className={`${
                            isCompleted
                              ? "text-green-700 dark:text-green-300"
                              : isNextStep
                                ? "text-primary/70 dark:text-primary/80"
                                : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.helpLink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(step.helpLink, "_blank")}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {!isCompleted && (
                        <Button
                          onClick={() => handleStepAction(step)}
                          className={`${
                            isNextStep
                              ? "bg-primary hover:bg-primary/90 text-white"
                              : "bg-gray-600 hover:bg-gray-700 text-white"
                          }`}
                        >
                          {step.actionText}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
    </div>
  );
}
