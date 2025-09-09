// src/components/Header.tsx
import {
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  return (
    <header className="w-full h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between">
      <input
        type="text"
        placeholder="Search transaction by keywords..."
        className="w-1/2 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </header>
  );
}
