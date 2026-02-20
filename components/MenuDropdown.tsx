'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg">
          <button
            onClick={() => {
              router.push('/missing');
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Missing (Editable)
          </button>

          <button
            onClick={() => {
              router.push('/all');
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Show All Records
          </button>
        </div>
      )}
    </div>
  );
}
