import React, { useEffect, useState } from 'react';
import { mockService } from '../../services/mockService';
import { TravelRequest, User, RequestStatus, StatusTranslation, TypeTranslation } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

interface UserDashboardProps {
  user: User;
}

const statusColors: Record<string, string> = {
  [RequestStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [RequestStatus.ACCEPTED]: 'bg-indigo-100 text-indigo-800',
  [RequestStatus.INFO_NEEDED]: 'bg-yellow-100 text-yellow-800',
  [RequestStatus.BOOKING]: 'bg-purple-100 text-purple-800',
  [RequestStatus.SUCCESS]: 'bg-green-100 text-green-800',
  [RequestStatus.FAILED]: 'bg-red-100 text-red-800',
  [RequestStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  [RequestStatus.CLOSED]: 'bg-gray-200 text-gray-700',
};

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const data = await mockService.getRequests(user);
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();
  }, [user]);

  const filteredRequests = requests.filter(req => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return [RequestStatus.SUBMITTED, RequestStatus.ACCEPTED, RequestStatus.BOOKING, RequestStatus.INFO_NEEDED].includes(req.status);
    if (filter === 'COMPLETED') return [RequestStatus.SUCCESS, RequestStatus.CLOSED].includes(req.status);
    return true;
  });

  const getFilterLabel = (key: string) => {
    switch(key) {
        case 'ALL': return '全部';
        case 'ACTIVE': return '进行中';
        case 'COMPLETED': return '已完成';
        default: return key;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的需求</h1>
          <p className="text-gray-500 text-sm mt-1">追踪您的差旅预定状态</p>
        </div>
        <Link 
          to="/user/create" 
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          新建需求
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-2 overflow-x-auto">
           {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
             <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
             >
               {getFilterLabel(f)}
             </button>
           ))}
        </div>

        {/* List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
             <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : filteredRequests.length === 0 ? (
             <div className="p-12 text-center">
               <div className="mx-auto h-12 w-12 text-gray-300 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">暂无需求</h3>
               <p className="text-gray-500 mt-1">开始创建您的第一个差旅需求吧。</p>
             </div>
          ) : (
            filteredRequests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => navigate(`/user/request/${req.id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors block"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 text-lg">{req.data.purpose}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${statusColors[req.status] || 'bg-gray-100'}`}>
                        {StatusTranslation[req.status]}
                      </span>
                      {req.data.urgency === 'URGENT' && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                          加急
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-3">
                      <span>{TypeTranslation[req.type]}</span>
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>ID: {req.id}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                       {req.type === 'FLIGHT' && (req.data as any).departureCity + ' ➔ ' + (req.data as any).arrivalCity}
                       {req.type === 'HOTEL' && (req.data as any).city + ', ' + (req.data as any).checkInDate}
                       {req.type === 'CAR_RENTAL' && (req.data as any).pickupCity}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400">
                     <span className="text-sm">查看详情 &rarr;</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
