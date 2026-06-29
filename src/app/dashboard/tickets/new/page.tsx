import NewTicketForm from "./NewTicketForm";

export const metadata = { title: "New Ticket — Ferrion Portal" };

export default function NewTicketPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Support Ticket</h1>
      <div className="card p-6">
        <NewTicketForm />
      </div>
    </div>
  );
}
