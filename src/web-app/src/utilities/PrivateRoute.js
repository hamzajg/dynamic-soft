import React, {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import {AuthenticationContext} from "../modules/authentication/AuthenticatonProvider";

const PrivateRoute = ({ component }) => {
    const { isAuthenticated } = useContext(AuthenticationContext);

    return isAuthenticated ? component : <Navigate to="/authentication" />
};

export default PrivateRoute;
