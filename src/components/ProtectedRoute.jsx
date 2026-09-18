import { useAuth } from '@clerk/react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';


function ProtectedRoute() {

    const { isLoaded, isSignedIn } = useAuth();
    const location = useLocation();
  
    if( !isLoaded ) {
        return <p>Loading...</p>
    }
  

    if(!isSignedIn) {
        return (<Navigate 
                    to='/login' 
                    replace
                    state={{ from: location }}
                    />)
    }

    return <Outlet/>
}

export default ProtectedRoute