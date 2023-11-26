import { BrowserRouter as Router } from "react-router-dom";
// import { HashRouter as Router } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import SystemTitle from "./shared/special/SystemTitle";
import GlobalProvider from "./context/GlobalProvider";
import ReactQueryProvider from "./context/ReactQueryProvider";
import ThemeProvider from "./context/ThemeProvider";
import GlobalRoutes from "./routes/GlobalRoutes";

const App = () => {
  return (
    <Router>
      <ReactQueryProvider openReactQueryDevtools={false}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <GlobalProvider>
            <ThemeProvider>
              <DndProvider backend={HTML5Backend}>
                <GlobalRoutes />
                <SystemTitle />
              </DndProvider>
            </ThemeProvider>
          </GlobalProvider>
        </LocalizationProvider>
      </ReactQueryProvider>
    </Router>
  );
};

export default App;

// xs：额外小的屏幕（通常移动设备）
// sm：小屏幕（平板电脑）
// md：中等屏幕（桌面电脑）
// lg：大屏幕（大型桌面电脑）
// xl：额外大的屏幕（通常较大的显示器）
