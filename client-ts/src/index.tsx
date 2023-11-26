import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
const rootElement = createRoot(root!);
rootElement.render(
  // <StrictMode>
  <App />
  // </StrictMode>
);

// 依賴檢查
// npm i -g depcheck
// 運行
// depcheck

// npm run build
// npm install -g serve
// serve -s build -p 5001
// 取消輸出
// serve -s build | Out-Null
