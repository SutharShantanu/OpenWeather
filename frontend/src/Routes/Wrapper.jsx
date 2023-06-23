import React from "react";
import AllRoutes from "./AllRoutes";
import { Box } from "@chakra-ui/react";

const Wrapper = () => {
    return (
        <Box marginTop={{ base: "10px", md: "50px" }}>
            <AllRoutes />
        </Box>
    );
};

export default Wrapper;
