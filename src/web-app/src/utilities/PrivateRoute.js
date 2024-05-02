import React, {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import {AuthenticationContext} from "../modules/authentication/AuthenticatonProvider";

const PrivateRoute = ({ component:Component }) => {
    const { isAuthenticated } = useContext(AuthenticationContext);

    return isAuthenticated ? <Component /> : <Navigate to="/authentication" />
};

export default PrivateRoute;
