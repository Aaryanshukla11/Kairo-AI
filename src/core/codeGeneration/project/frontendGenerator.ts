import { TechnologyStack } from './projectTypes';

export class FrontendGenerator {
  public generate(stack: TechnologyStack, projectType: string, files: Record<string, string>): void {
    const isHospital = projectType === 'Hospital Management';

    // 1. App.tsx
    files['frontend/src/App.tsx'] = `import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className={darkMode ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-white text-gray-900 min-h-screen'}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <Dashboard />}
        </main>
      </div>
    </div>
  );
}
`;

    // 2. Navbar.tsx
    files['frontend/src/components/Navbar.tsx'] = `import React from 'react';

export function Navbar({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-emerald-400">Kairo-AI generated: ${projectType}</span>
      </div>
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold"
      >
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </header>
  );
}
`;

    // 3. Sidebar.tsx
    files['frontend/src/components/Sidebar.tsx'] = `import React from 'react';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (v: string) => void }) {
  return (
    <aside className="w-64 border-r border-gray-700 min-h-screen bg-gray-800 p-4">
      <nav className="flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'w-full text-left px-4 py-2 bg-emerald-500 rounded text-white font-semibold' : 'w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded'}
        >
          Dashboard
        </button>
        <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
          Users & Security
        </button>
        <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
          Settings Configuration
        </button>
      </nav>
    </aside>
  );
}
`;

    // 4. Dashboard.tsx
    files['frontend/src/components/Dashboard.tsx'] = `import React from 'react';
import { InvoiceTable } from './InvoiceTable';

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Analytics Control Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400">TOTAL SESSIONS</h3>
          <p className="text-3xl font-bold mt-2">1,248</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400">ACTIVE CLIENTS</h3>
          <p className="text-3xl font-bold mt-2">86%</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400">HEALTH STATUS</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-400">🟢 EXCELLENT</p>
        </div>
      </div>

      <InvoiceTable />
    </div>
  );
}
`;

    // 5. PatientForm.tsx
    files['frontend/src/components/PatientForm.tsx'] = `import React, { useState } from 'react';

export function PatientForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, age: parseInt(age), condition });
    setName('');
    setAge('');
    setCondition('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-6 bg-gray-800 rounded border border-gray-700">
      <h3 className="text-lg font-bold">Register Intake Details</h3>
      <input 
        type="text" 
        placeholder="Intake Client Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" 
        required 
      />
      <input 
        type="number" 
        placeholder="Client Age" 
        value={age} 
        onChange={(e) => setAge(e.target.value)} 
        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" 
        required 
      />
      <input 
        type="text" 
        placeholder="Primary Diagnoses" 
        value={condition} 
        onChange={(e) => setCondition(e.target.value)} 
        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white" 
        required 
      />
      <button type="submit" className="py-2 bg-emerald-500 hover:bg-emerald-600 rounded font-bold">
        Submit Registry
      </button>
    </form>
  );
}
`;

    // 6. AppointmentModal.tsx
    files['frontend/src/components/AppointmentModal.tsx'] = `import React from 'react';

export function AppointmentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md border border-gray-700">
        <h3 className="text-lg font-bold">Schedule Consulting Event</h3>
        <p className="text-sm text-gray-400 mt-2">Map timeslots availability profiles for active doctors directory.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
            Cancel
          </button>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded font-bold">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
`;

    // 7. InvoiceTable.tsx
    files['frontend/src/components/InvoiceTable.tsx'] = `import React from 'react';

export function InvoiceTable() {
  const data = [
    { id: '101', name: 'Albin Mitchell', date: '2026-08-04', amount: '$150.00', status: 'PAID' },
    { id: '102', name: 'Selena Gomez', date: '2026-08-05', amount: '$240.00', status: 'PENDING' },
  ];

  return (
    <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold">Recent Billing Logs</h3>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-950 text-gray-400 text-xs">
            <th className="p-4">BILL ID</th>
            <th className="p-4">CLIENT NAME</th>
            <th className="p-4">DATE</th>
            <th className="p-4">AMOUNT</th>
            <th className="p-4">STATUS</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-700">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-700">
              <td className="p-4">#{row.id}</td>
              <td className="p-4">{row.name}</td>
              <td className="p-4">{row.date}</td>
              <td className="p-4">{row.amount}</td>
              <td className="p-4">
                <span className={row.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;

    // 8. styles & indices
    files['frontend/src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
}
`;

    files['frontend/src/main.tsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  }
}

export const frontendGenerator = new FrontendGenerator();
