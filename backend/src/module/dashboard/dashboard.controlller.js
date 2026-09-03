import * as dashboardService from './dashboard.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

// ==================== FULL DASHBOARD STATISTICS ====================
export const getDashboardStats = async (req, res) => {
  try {
    const { period, startDate, endDate, doctorId } = req.query;
    const stats = await dashboardService.getDashboardStatistics({ period, startDate, endDate, doctorId });
    return successResponse(res, stats, 'Dashboard statistics fetched successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse(res, error.message || 'Failed to fetch dashboard statistics');
  }
};

// ==================== DAILY SUMMARY ====================
export const getDailySummary = async (req, res) => {
  try {
    const summary = await dashboardService.getDailySummary();
    return successResponse(res, summary, 'Daily summary fetched successfully');
  } catch (error) {
    console.error('Daily summary error:', error);
    return errorResponse(res, error.message || 'Failed to fetch daily summary');
  }
};

// ==================== REVENUE REPORT ====================
export const getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const report = await dashboardService.getRevenueReport(from, to);
    return successResponse(res, report, 'Revenue report fetched successfully');
  } catch (error) {
    console.error('Revenue report error:', error);
    return errorResponse(res, error.message || 'Failed to fetch revenue report');
  }
};

// ==================== DOCTOR LOAD ====================
export const getDoctorLoad = async (req, res) => {
  try {
    const { from, to } = req.query;
    const load = await dashboardService.getDoctorLoad(from, to);
    return successResponse(res, load, 'Doctor load report fetched successfully');
  } catch (error) {
    console.error('Doctor load error:', error);
    return errorResponse(res, error.message || 'Failed to fetch doctor load');
  }
};