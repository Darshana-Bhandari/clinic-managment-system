
import { ThemeProvider } from './contexts/ThemeContext';
import { DoctorProvider } from './contexts/DoctorContext';
import AppRouter from './Routes/AppRouter'

function App() {
  return (
    <ThemeProvider>
      <DoctorProvider>
        <AppRouter />
      </DoctorProvider>
    </ThemeProvider>
  );
}

export default App;