import Header from '@/components/layout/Header';
import ComplaintForm from '@/components/complaints/ComplaintForm';

export default function NewComplaintPage() {
  return (
    <div>
      <Header title="Raise Complaint" />
      <div className="bg-white rounded-2xl p-8 border border-border max-w-3xl">
        <ComplaintForm />
      </div>
    </div>
  );
}
