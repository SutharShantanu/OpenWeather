import React, { useEffect, useState } from "react";
import Empty from "../Components/Empty";
import { useLocation } from "react-router-dom";

const Search = () => {
    const location = useLocation();


    return (
        <div>
            <Empty />
        </div>
    );
};

export default Search;
