import { Check, Clock3, History, FileText } from 'lucide-react'
import { JSX } from 'react'

type StatusConfig = {
  color: string
  icon: JSX.Element
  label?: string
}

const statusMap: Record<string, StatusConfig> = {
  Live: {
    color: 'bg-green-100 text-green-700',
    icon: <Check className="h-4 w-4" />,
  },
  Upcoming: {
    color: 'bg-blue-100 text-blue-700',
    icon: <Clock3 className="h-4 w-4" />,
  },
  Past: {
    color: 'bg-orange-100 text-orange-700',
    icon: <History className="h-4 w-4" />,
    label: 'Completed',
  },
}

type StatusBadgeProps = {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const currentStatus =
    statusMap[status] || {
      color: 'bg-gray-100 text-gray-700',
      icon: <FileText className="h-4 w-4" />,
      label: status,
    }

  return (
    <span
      className={`inline-flex items-center gap-1 w-fit px-3 py-1 mb-2 text-xs rounded-full ${currentStatus.color}`}
    >
      {currentStatus.icon}
      {currentStatus.label ?? status}
    </span>
  )
}
