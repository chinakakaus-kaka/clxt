import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { TravelRequest, User, RequestStatus, StatusTranslation, TypeTranslation } from '../../types';
import { ArrowLeft, MessageSquare, Check, X, AlertTriangle, Upload, FileCheck } from 'lucide-react';

interface AdminRequestDetailProps {
  user: User;
}

const AdminRequestDetail: React.FC<AdminRequestDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [comment, setComment] = useState('');
  
  // Action Modals State
  const [actionMode, setActionMode] = useState<'NONE' | 'COMPLETE' | 'FAIL' | 'INFO'>('NONE');
  const [bookingDetails, setBookingDetails] = useState({ orderId: '', price: '', platform: '' });
  const [failReason, setFailReason] = useState('');

  const refresh = async () => {
    if (id) {
      const data = await mockService.getRequestById(id);
      if (data) setRequest(data);
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  if (!request) return <div>加载中...</div>;

  const handleStatusChange = async (status: RequestStatus) => {
    if (!id) return;
    await mockService.updateStatus(id, status, user);
    refresh();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    await mockService.addComment(id, user, comment);
    setComment('');
    refresh();
  };

  const handleCompleteBooking = async () => {
    if (!id) return;
    await mockService.completeBooking(id, user, {
        ...bookingDetails,
        price: parseFloat(bookingDetails.price)
    });
    setActionMode('NONE');
    refresh();
  };

  const handleFailBooking = async () => {
      if(!id) return;
      await mockService.failBooking(id, user, failReason);
      setActionMode('NONE');
      refresh();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </button>
        <div className="flex flex-wrap gap-2 md:gap-3">
            {request.status === RequestStatus.SUBMITTED && (
                <button 
                    onClick={() => handleStatusChange(RequestStatus.ACCEPTED)}
                    className="flex-1 md:flex-none justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
                >
                    受理需求
                </button>
            )}
            {request.status === RequestStatus.ACCEPTED && (
                <>
                    <button 
                        onClick={() => handleStatusChange(RequestStatus.BOOKING)}
                        className="flex-1 md:flex-none justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                    >
                        开始预定
                    </button>
                    <button 
                        onClick={() => handleStatusChange(RequestStatus.INFO_NEEDED)}
                        className="flex-1 md:flex-none justify-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 font-medium shadow-sm"
                    >
                        要求补全信息
                    </button>
                </>
            )}
             {request.status === RequestStatus.BOOKING && (
                <>
                    <button 
                        onClick={() => setActionMode('COMPLETE')}
                        className="flex-1 md:flex-none justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium shadow-sm flex items-center"
                    >
                        <Check className="w-4 h-4 mr-2"/>
                        预定成功
                    </button>
                     <button 
                        onClick={() => setActionMode('FAIL')}
                        className="flex-1 md:flex-none justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium shadow-sm flex items-center"
                    >
                        <X className="w-4 h-4 mr-2"/>
                        预定失败
                    </button>
                </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
           {/* Request Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-gray-100 pb-4 gap-4">
                 <div className="w-full">
                    <h2 className="text-2xl font-bold text-gray-900 break-words">{request.data.purpose}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {TypeTranslation[request.type]}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {StatusTranslation[request.status]}
                        </span>
                         {request.data.urgency === 'URGENT' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                加急
                            </span>
                         )}
                    </div>
                 </div>
                 <div className="text-left md:text-right min-w-fit">
                    <p className="text-sm text-gray-500">申请人</p>
                    <p className="font-medium text-gray-900">{request.userName}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-sm">
                  {Object.entries(request.data).map(([key, value]) => {
                      if (key === 'travelers' || typeof value === 'object') return null;
                      return (
                          <div key={key}>
                              <p className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="font-medium text-gray-900">{String(value)}</p>
                          </div>
                      );
                  })}
              </div>
           </div>

           {/* Booking Result (If Success) */}
           {request.status === RequestStatus.SUCCESS && request.bookingResult && (
               <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
                   <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                       <FileCheck className="w-5 h-5 mr-2" />
                       预定确认
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       <div>
                           <p className="text-sm text-green-700">订单号</p>
                           <p className="font-bold text-green-900 break-all">{request.bookingResult.orderId}</p>
                       </div>
                       <div>
                           <p className="text-sm text-green-700">预定平台</p>
                           <p className="font-bold text-green-900">{request.bookingResult.platform}</p>
                       </div>
                       <div>
                           <p className="text-sm text-green-700">总价</p>
                           <p className="font-bold text-green-900">¥{request.bookingResult.price}</p>
                       </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-green-200">
                       <p className="text-sm text-green-700 mb-2">附件</p>
                       <div className="flex flex-col sm:flex-row gap-2">
                           {request.bookingResult.files?.map((f, i) => (
                               <a key={i} href={f} target="_blank" rel="noreferrer" className="text-green-600 underline text-sm hover:text-green-800">
                                   查看文件 {i + 1}
                               </a>
                           ))}
                       </div>
                   </div>
               </div>
           )}
        </div>

        {/* Sidebar: Activity & Chat */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px] lg:h-[600px]">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        活动日志
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {request.comments.map(c => (
                        <div key={c.id} className={`flex flex-col ${c.role === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 ${c.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-900'}`}>
                                <p className="text-xs text-gray-500 mb-1 flex justify-between w-full min-w-[120px]">
                                    <span className="font-bold">{c.author}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </p>
                                <p className="text-sm">{c.content}</p>
                            </div>
                        </div>
                    ))}
                    {request.history.map(h => (
                         <div key={h.id} className="flex justify-center">
                             <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                 {h.actor} {h.action.toLowerCase().replace(/_/g, ' ')} • {new Date(h.timestamp).toLocaleDateString()}
                             </span>
                         </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleAddComment}>
                        <div className="flex space-x-2">
                            <input 
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="添加备注或回复..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button type="submit" className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800">
                                发送
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>

      {/* Action Modals - Full screen on mobile */}
      {actionMode === 'COMPLETE' && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
              <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4">完成预定</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">预定平台</label>
                          <input type="text" className="w-full border p-2 rounded" value={bookingDetails.platform} onChange={e => setBookingDetails({...bookingDetails, platform: e.target.value})} placeholder="例：携程、航司官网" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">订单号</label>
                          <input type="text" className="w-full border p-2 rounded" value={bookingDetails.orderId} onChange={e => setBookingDetails({...bookingDetails, orderId: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">总金额</label>
                          <input type="number" className="w-full border p-2 rounded" value={bookingDetails.price} onChange={e => setBookingDetails({...bookingDetails, price: e.target.value})} placeholder="0.00" />
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                          <Upload className="mx-auto w-8 h-8 mb-2" />
                          <p className="text-sm">点击上传行程单/凭证 (模拟)</p>
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                      <button onClick={() => setActionMode('NONE')} className="flex-1 sm:flex-none px-4 py-2 border rounded hover:bg-gray-50">取消</button>
                      <button onClick={handleCompleteBooking} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">确认完成</button>
                  </div>
              </div>
          </div>
      )}

      {actionMode === 'FAIL' && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
               <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl p-6 w-full max-w-md">
                   <div className="flex items-center space-x-2 text-red-600 mb-4">
                       <AlertTriangle className="w-6 h-6" />
                       <h3 className="text-lg font-bold">标记为失败</h3>
                   </div>
                   <p className="text-sm text-gray-500 mb-4">请填写失败原因，这将发送给申请人。</p>
                   <textarea 
                        className="w-full border p-2 rounded h-24" 
                        value={failReason}
                        onChange={e => setFailReason(e.target.value)}
                        placeholder="例：无票、价格超标、信息错误..."
                   />
                   <div className="mt-6 flex justify-end space-x-3">
                       <button onClick={() => setActionMode('NONE')} className="flex-1 sm:flex-none px-4 py-2 border rounded hover:bg-gray-50">取消</button>
                       <button onClick={handleFailBooking} className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">确认失败</button>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default AdminRequestDetail;