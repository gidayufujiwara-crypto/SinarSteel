import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import UpdateNotifier from './components/UpdateNotifier';
function App() {
    return (_jsxs(BrowserRouter, { children: [_jsx(UpdateNotifier, {}), _jsx(AppRouter, {})] }));
}
export default App;
