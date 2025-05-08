
import { Navigate } from 'react-router-dom';

// Instead of directly rendering Home, we'll navigate to the root route
// which is already wrapped with AuthProvider in App.tsx
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
