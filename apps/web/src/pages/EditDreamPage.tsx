import { useParams } from 'react-router-dom';
import { DreamForm } from '../components/DreamForm';

export function EditDreamPage() {
  const { id } = useParams<{ id: string }>();
  
  return <DreamForm dreamId={id} />;
}