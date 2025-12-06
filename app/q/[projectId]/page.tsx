import { Metadata } from 'next';
import { QuestionnaireView } from '@/components/questionnaire/QuestionnaireView';

export const metadata: Metadata = {
  title: 'Questionnaire | Speculate',
  description: 'Take part in this interactive questionnaire',
};

interface QuestionnairePageProps {
  // Use permissive params typing to align with Next generated types
  params?: any;
}

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const projectId = params?.projectId;

  return (
    <main className="min-h-screen bg-background">
      <QuestionnaireView projectId={projectId} />
    </main>
  );
}