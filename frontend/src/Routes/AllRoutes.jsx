import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "../Pages/Homepage";
import Search from "../Pages/Search";
import NotFound from "../Pages/404";

const AllRoutes = () => {
    return (
        <Routes >
            <Route path="/" element={<Homepage />} />
            <Route path="/weather/search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AllRoutes;
