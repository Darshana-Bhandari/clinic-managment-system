import { ThemeProvider } from './contexts/ThemeContext';
import { DoctorProvider } from './contexts/DoctorContext';
import { DepartmentProvider } from './contexts/DepartmentContext.jsx';
import AppRouter from './Routes/AppRouter'

function App() {
  return (
    <ThemeProvider>
      <DoctorProvider>
        <DepartmentProvider>
          <AppRouter />
        </DepartmentProvider>
      </DoctorProvider>
    </ThemeProvider>
  );
}

export default App;