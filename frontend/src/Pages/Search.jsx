import React, { useEffect, useState } from "react";
import Empty from "../Components/Empty";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Result from "../Components/Result";

const Search = () => {
    const location = useLocation();
    const [searchResult, setSearchResult] = useState(null);
    const searchParams = new URLSearchParams(location.search);
    const locationParam = searchParams.get("location");
    useEffect(() => {
        if (locationParam) {
            axios
                .get(`http://localhost:4500/weather/search/${locationParam}`)
                .then((res) => {
                    const weatherData = res.data;
                    setSearchResult(weatherData);
                })
                .catch((error) => {
                    console.error(error);
                    setSearchResult(null);
                });
        }
    }, [locationParam]);
    console.log(searchResult);

    return (
        <div>
            {searchResult ? (
                <div>
                    <Result location={locationParam} {...searchResult} />
                </div>
            ) : (
                <Empty />
            )}
        </div>
    );
};

export default Search;
