import { SymptomLogForm } from '@/components/symptoms/symptom-log-form';
import { getTodayDateKey } from '@/constants/symptom-log';

export default function SymptomLogNewScreen() {
  return <SymptomLogForm initialDateKey={getTodayDateKey()} />;
}
