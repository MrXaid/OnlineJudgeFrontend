import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService from '@/services/adminUserService';

const UserList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/unauthorized');
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">👥 All Users</h2>
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white dark:bg-gray-900">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm uppercase font-semibold">
            <tr>
              <th className="p-4 text-left w-12">#</th>
              <th className="p-4 text-left">Photo</th>
              <th className="p-4 text-left">Username</th>
              <th className="p-4 text-left">First Name</th>
              <th className="p-4 text-left">Last Name</th>
              <th className="p-4 text-left">Country</th>
              <th className="p-4 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((u, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <td className="p-4 font-semibold text-center text-gray-500 dark:text-gray-400">{index + 1}</td>
                <td className="p-4">
                  <img
                    src={`http://localhost:8080/uploads/${u.photoUrl}`}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border shadow"
                    onError={(e) => { e.target.src = 'http://localhost:8080/uploads/default.png'; }}
                  />
                </td>
                <td className="p-4 font-medium">{u.username}</td>
                <td className="p-4">{u.firstName || '-'}</td>
                <td className="p-4">{u.lastName || '-'}</td>
                <td className="p-4">{u.country || '-'}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{u.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
