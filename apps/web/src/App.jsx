import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '@/store/slices/authSlice';
import { selectUser } from '@/store/slices/authSlice';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import PageLoader from '@/components/common/PageLoader';

const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Employees = lazy(() => import('@/pages/Employees'));
const EmployeeDetail = lazy(() => import('@/pages/EmployeeDetail'));
const Leaves = lazy(() => import('@/pages/Leaves'));
const Departments = lazy(() => import('@/pages/Departments'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<ProtectedRoute roles={['admin', 'hr']} />}>
              <Route index element={<Employees />} />
              <Route path=":id" element={<EmployeeDetail />} />
            </Route>
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/departments" element={<ProtectedRoute roles={['admin', 'hr']} />}>
              <Route index element={<Departments />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
