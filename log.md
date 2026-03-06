# 開發對話紀錄 (Development Log)

從現在開始的對話紀錄與重大決定都會記錄於此檔案中。

## 階段 1：專案建立與初始化 (Project Setup)
- 建立 `log.md` 紀錄開發過程。
- 初始化 Git 儲存庫。
- 建立 `requirements.txt`，包含 Flask 與 Numpy 等相依套件。

## 階段 2：強化學習演算法與 Flask 全端開發 (Backend Implementation)
- 實作 `solver.py`：建立 `GridWorld` 類別處理動態大小、障礙物設置，並執行 Value Iteration 與路徑回溯。
- 實作 `app.py`：建立 Flask Web 伺服器，設計 `/api/solve` 處理路徑計算。

## 階段 3：前端視覺化介面 (Frontend Implementation)
- 建置 `templates/index.html` 提供雙網格介面。
- 建置 `static/style.css` 提供顏色辨識 (黃色為最佳路徑、紅色為終點等)。
- 建置 `static/script.js` 實作 API 串接與方格點擊切換障礙物。

## 階段 4：本地端測試與建立說明文件 (Testing & Documentation)
- 撰寫 `README.md`，提供使用說明。
- 測試 Python 模組是否正確運作與收斂。

## 階段 5：自動化推送到 GitHub 與部署 (Deployment)
- 加入所有檔案至 Git 追蹤並建立 Commit。
- 準備推送至 GitHub 名為 `rl-gridworld-visualizer-hw` 的庫。
