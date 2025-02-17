import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import Themeroutes from './routes/Router';

const App = () => {
    const routing = useRoutes(Themeroutes);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="dark">{routing}</div>
        </Suspense>
    );
};

export default App;
