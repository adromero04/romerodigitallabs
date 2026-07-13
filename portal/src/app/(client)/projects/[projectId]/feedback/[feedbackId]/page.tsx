import { notFound } from "next/navigation";
import { FeedbackResponseForm } from "@/components/feedback/FeedbackResponseForm";
import { PageHeader } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import { getFeedbackRequest, getProjectForClient } from "@/lib/data/client";
import { createClient } from "@/lib/supabase/server";
import { canSubmitFinalApproval } from "@/lib/permissions";
import type { FeedbackResponse } from "@/types/database";

type Props = {
  params: Promise<{ projectId: string; feedbackId: string }>;
};

export const metadata = { title: "Feedback" };

export default async function FeedbackPage({ params }: Props) {
  const profile = await requireClient();
  if (!profile.client_id) notFound();

  const { projectId, feedbackId } = await params;
  const project = await getProjectForClient(projectId, profile.client_id);
  if (!project) notFound();

  const request = await getFeedbackRequest(feedbackId);
  if (!request || request.project_id !== projectId) notFound();

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("feedback_responses")
    .select("*")
    .eq("feedback_request_id", feedbackId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="stack">
      <PageHeader title="Review and respond" description={project.name} />
      <FeedbackResponseForm
        request={request}
        existing={(existing as FeedbackResponse | null) ?? null}
        canApprove={canSubmitFinalApproval(profile)}
      />
    </div>
  );
}
