import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  removeAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  login(credentials) {
    return this.api.post('/auth/login', credentials);
  }

  register(userData) {
    return this.api.post('/auth/register', userData);
  }

  getCurrentUser() {
    return this.api.get('/auth/me');
  }

  updateProfile(profileData) {
    return this.api.put('/auth/profile', profileData);
  }

  changePassword(passwordData) {
    return this.api.put('/auth/change-password', passwordData);
  }

  // Dashboard endpoints
  getDashboardOverview() {
    return this.api.get('/dashboard/overview');
  }

  getRecentActivities(limit = 10) {
    return this.api.get(`/dashboard/recent-activities?limit=${limit}`);
  }

  getProjectStatus() {
    return this.api.get('/dashboard/project-status');
  }

  getDepartmentWorkload() {
    return this.api.get('/dashboard/department-workload');
  }

  getMaterialCategories() {
    return this.api.get('/dashboard/material-categories');
  }

  getMaintenanceCompliance() {
    return this.api.get('/dashboard/maintenance-compliance');
  }

  getTaskPerformance() {
    return this.api.get('/dashboard/task-performance');
  }

  getAlerts() {
    return this.api.get('/dashboard/alerts');
  }

  getCostAnalysis(params = {}) {
    return this.api.get('/dashboard/cost-analysis', { params });
  }

  // Materials endpoints
  getMaterials(params = {}) {
    return this.api.get('/materials', { params });
  }

  getMaterial(id) {
    return this.api.get(`/materials/${id}`);
  }

  createMaterial(materialData) {
    return this.api.post('/materials', materialData);
  }

  updateMaterial(id, materialData) {
    return this.api.put(`/materials/${id}`, materialData);
  }

  updateMaterialQuantity(id, quantityData) {
    return this.api.patch(`/materials/${id}/quantity`, quantityData);
  }

  deleteMaterial(id) {
    return this.api.delete(`/materials/${id}`);
  }

  getMaterialCategories() {
    return this.api.get('/materials/meta/categories');
  }

  getLowStockMaterials() {
    return this.api.get('/materials/alerts/low-stock');
  }

  // Projects endpoints
  getProjects(params = {}) {
    return this.api.get('/projects', { params });
  }

  getProject(id) {
    return this.api.get(`/projects/${id}`);
  }

  createProject(projectData) {
    return this.api.post('/projects', projectData);
  }

  updateProject(id, projectData) {
    return this.api.put(`/projects/${id}`, projectData);
  }

  updateProjectStatus(id, statusData) {
    return this.api.patch(`/projects/${id}/status`, statusData);
  }

  allocateMaterials(id, materialsData) {
    return this.api.post(`/projects/${id}/allocate-materials`, materialsData);
  }

  addMilestone(id, milestoneData) {
    return this.api.post(`/projects/${id}/milestones`, milestoneData);
  }

  completeMilestone(id, milestoneIndex, completionData) {
    return this.api.patch(`/projects/${id}/milestones/${milestoneIndex}/complete`, completionData);
  }

  deleteProject(id) {
    return this.api.delete(`/projects/${id}`);
  }

  // BOM endpoints
  getBOMs(params = {}) {
    return this.api.get('/bom', { params });
  }

  getBOM(id) {
    return this.api.get(`/bom/${id}`);
  }

  createBOM(bomData) {
    return this.api.post('/bom', bomData);
  }

  updateBOM(id, bomData) {
    return this.api.put(`/bom/${id}`, bomData);
  }

  approveBOM(id) {
    return this.api.patch(`/bom/${id}/approve`);
  }

  releaseBOM(id) {
    return this.api.patch(`/bom/${id}/release`);
  }

  getBOMCostAnalysis(id) {
    return this.api.get(`/bom/${id}/cost-analysis`);
  }

  deleteBOM(id) {
    return this.api.delete(`/bom/${id}`);
  }

  // Maintenance endpoints
  getMaintenanceRecords(params = {}) {
    return this.api.get('/maintenance', { params });
  }

  getMaintenanceRecord(id) {
    return this.api.get(`/maintenance/${id}`);
  }

  createMaintenanceRecord(maintenanceData) {
    return this.api.post('/maintenance', maintenanceData);
  }

  updateMaintenanceRecord(id, maintenanceData) {
    return this.api.put(`/maintenance/${id}`, maintenanceData);
  }

  updateMaintenanceStatus(id, statusData) {
    return this.api.patch(`/maintenance/${id}/status`, statusData);
  }

  addMaintenanceMaterials(id, materialsData) {
    return this.api.post(`/maintenance/${id}/materials`, materialsData);
  }

  completeMaintenanceTask(id, taskIndex, completionData) {
    return this.api.patch(`/maintenance/${id}/tasks/${taskIndex}/complete`, completionData);
  }

  getOverdueMaintenance() {
    return this.api.get('/maintenance/alerts/overdue');
  }

  getUpcomingMaintenance() {
    return this.api.get('/maintenance/alerts/upcoming');
  }

  deleteMaintenanceRecord(id) {
    return this.api.delete(`/maintenance/${id}`);
  }

  // Tasks endpoints
  getTasks(params = {}) {
    return this.api.get('/tasks', { params });
  }

  getTask(id) {
    return this.api.get(`/tasks/${id}`);
  }

  createTask(taskData) {
    return this.api.post('/tasks', taskData);
  }

  updateTask(id, taskData) {
    return this.api.put(`/tasks/${id}`, taskData);
  }

  updateTaskStatus(id, statusData) {
    return this.api.patch(`/tasks/${id}/status`, statusData);
  }

  addTaskComment(id, commentData) {
    return this.api.post(`/tasks/${id}/comments`, commentData);
  }

  completeSubtask(id, subtaskIndex) {
    return this.api.patch(`/tasks/${id}/subtasks/${subtaskIndex}/complete`);
  }

  getOverdueTasks() {
    return this.api.get('/tasks/alerts/overdue');
  }

  getMyTasks(params = {}) {
    return this.api.get('/tasks/my/assigned', { params });
  }

  deleteTask(id) {
    return this.api.delete(`/tasks/${id}`);
  }
}

const apiService = new ApiService();
export default apiService;
