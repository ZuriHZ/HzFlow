import { useEffect } from 'react';
import { MyRoutes } from './routes/routes';
import { useUpdaterStore } from './features/updater/store/useUpdaterStore';

function App() {
    const initListeners = useUpdaterStore((s) => s.initListeners);
    
    useEffect(() => {
        initListeners();
    }, [initListeners]);

    return <MyRoutes />;
}

export default App;
