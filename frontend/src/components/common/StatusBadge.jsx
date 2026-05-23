export default function StatusBadge({ status }) {
  const colors = {
    Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    Confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
    Shipped: 'bg-orange-100 text-orange-800 border border-orange-200',
    Delivered: 'bg-green-100 text-green-800 border border-green-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
      {status}
    </span>
  );
}
