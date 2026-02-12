
import React, { useState } from 'react';
import { Staff, Designation } from '../types.ts';

interface StaffManagementProps {
  staffList: Staff[];
  onAdd: (staff: Omit<Staff, 'id'>) => void;
  onUpdate: (staff: Staff) => void;
  onDelete: (id: string) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staffList, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    designation: 'RN' as Designation,
    rotaPattern: '15/13',
    startDate: new Date().toISOString().split('T')[0],
    active: true
  });

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      onUpdate({ ...editingStaff, ...formData });
    } else {
      onAdd(formData);
    }
    closeModal();
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      designation: staff.designation as Designation,
      rotaPattern: staff.rotaPattern,
      startDate: staff.startDate,
      active: staff.active
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      designation: 'RN',
      rotaPattern: '15/13',
      startDate: new Date().toISOString().split('T')[0],
      active: true
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium"
        >
          Add Staff Member
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pattern</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={staff.avatar || `https://picsum.photos/seed/${staff.id}/100`} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
                    <div>
                      <p className="font-semibold text-slate-800">{staff.name}</p>
                      <p className="text-xs text-slate-500">{staff.designation}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700 px-2 py-1 bg-slate-100 rounded-md">
                    {staff.rotaPattern}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {staff.startDate}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {staff.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(staff)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg">✏️</button>
                    <button onClick={() => onDelete(staff.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold">{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Dr. Sarah Jenkins"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Designation</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value as Designation})}
                      className="w-full px-4 py-2 rounded-xl border outline-none"
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="RN">RN (Nurse)</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Technician">Technician</option>
                      <option value="Trauma Head">Trauma Head</option>
                      <option value="Site Doctor">Site Doctor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Rota Pattern (Duty/Off)</label>
                    <input
                      required
                      type="text"
                      value={formData.rotaPattern}
                      onChange={(e) => setFormData({...formData, rotaPattern: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. 15/13"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Cycle Start Date</label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl shadow-lg">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
