# AutoML Research Platform (Local Simulation Edition)

This is a modern, single-page **AutoML Dashboard** built with **React**, **TypeScript**, and **Tailwind CSS**. 

It is designed to simulate a professional Machine Learning workflow (Upload -> Preprocessing -> Training -> Evaluation) directly in the browser. **No Python backend or API keys are required**; all training processes and visualizations are simulated using advanced mathematical logic within the frontend.

## 🚀 Features

- **Data Upload**: Parse CSV files locally and view data statistics.
- **Exploratory Data Analysis (EDA)**: Interactive histograms, value counts, and correlation heatmaps.
- **Preprocessing Pipeline**: Configure imputation, scaling, encoding, and class balancing (SMOTE).
- **Model Configuration**: Select ML (Random Forest, XGBoost), DL (CNN, LSTM), or NLP models with hyperparameter tuning.
- **Visualizations**: 
  - Interactive **ROC Curves**, **Confusion Matrices**, and **Learning Curves**.
  - **Data Projections**: Simulated PCA, t-SNE, and UMAP visualizations.
  - **Explainability**: Simulated SHAP and LIME charts explaining model decisions.
- **Dark Mode**: Fully responsive UI with a professional dark/light theme.

## 🛠️ Prerequisites

You need **Node.js** installed on your computer.
- [Download Node.js](https://nodejs.org/) (Version 16+ recommended)

## 📦 Installation Steps

1. **Download/Clone the project**
   Download the project files into a folder (e.g., `automl-platform`).

2. **Open Terminal**
   Navigate to the project folder in your terminal or command prompt:
   ```bash
   cd path/to/automl-platform
   ```

3. **Install Dependencies**
   Run the following command to install the necessary libraries (React, Tailwind, Recharts, Lucide Icons):
   ```bash
   npm install
   ```
   *Note: If you haven't initialized a package.json yet, copy the `package.json` file provided in the code into your root directory first.*

4. **Start the Application**
   Run the development server:
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   The terminal will show a link (usually `http://localhost:5173`). Click it to view the app.

## 🔧 Project Structure

- **`src/components/`**: UI Sections (Upload, Preprocessing, Results, etc.)
- **`src/services/simulationService.ts`**: The "Brain" of the app. It contains the hard-coded logic that mimics backend model training, metric calculation, and visualization data generation.
- **`src/services/utils.ts`**: CSV parsing and statistical calculation utilities.

## 📝 Usage

1. **Upload**: Drop a CSV file or select a sample dataset (e.g., Titanic, Iris).
2. **EDA**: Expand Section 2 to view distributions and correlations.
3. **Preprocessing**: Adjust settings in Section 3 (e.g., change imputation to "Median").
4. **Model**: Go to Section 4, pick a model (e.g., Random Forest), and enable Cross-Validation.
5. **Train**: Click "Start Training Simulation".
6. **Results**: Analyze the generated metrics, visualizations, and automated insights in Section 6.

---
*Built for educational and prototyping purposes.*
