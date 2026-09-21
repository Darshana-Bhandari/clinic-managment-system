import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../../services/notificationService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiAlertCircle,
  FiInfo,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // fetch 
  const fetchNotifications = async (params={})=>{
    setIsLoading(true);
    setError(null);
    try{
      const query = {
        page:pagination.page,
        limit:pagination.limit,
        ...(filter=== 'unread' && {unread:true}),
        ...params,
      }
      const data = await getNotifications(query);
      setNotifications(data.notification || data)
      if(data.pagination)
        setPagination

    }
    catch(err){
      const message = err.message?.data?.message || "failed to fetch notifications"
      setError(message)
      toast.error(message)

    }
  }

  useEffect(()=>{
    fetchNotifications();
  },[pagination.page, filter])


  //hanlders
  //handleMarksread
  //handlemarskallread
  //handleDelete
  //hanleClearALl

  //hanleNotificationsclick
  const handleNotificationClick = (notification)=>{
    if(!notification.read)
      handleMarkAsRead(notification.id) // single message lei seen ganru xa vane tesko handlers
    if(notification.link)
      navigate(notification.link)
  }
  //hanlePageChange
  const handlePageChange= (newPage ) =>{
    setPagination((p)  => ({...p, page:newPage}))
  }


  //helpers
  const getNotificationIcon = (type)=>{
    const icons ={
      APPOINTMENT :{icon:FiCalendar, color:'bg-blue-100 text-blue-600'},

    }

  }

  




  

  // RENDER 
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBell /> Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-red-500 text-white text-sm font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your appointments, payments, and more
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <FiCheck /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <FiTrash2 /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex">
            {['all', 'unread'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-6 py-4 text-sm font-medium capitalize ${
                  filter === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <FiBell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No notifications
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const { icon: Icon, color } = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex gap-4 p-4 cursor-pointer transition-colors ${
                    notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm ${
                              notification.read
                                ? 'font-medium text-gray-900'
                                : 'font-semibold text-gray-900'
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            title="Mark as read"
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;