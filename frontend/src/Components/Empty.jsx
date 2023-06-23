import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

export default function Empty() {
    return (
        <Flex align="center" justify="center" h="60vh" flexDirection="column">
            <Box
                textAlign="center"
                py={10}
                px={6}
                maxW={{ base: "90%", md: "50%" }}
                m="auto">
                <InfoIcon boxSize={"50px"} color={"blue.500"} />
                <Heading as="h2" size="xl" mt={6} mb={2}>
                    Start Exploring Weather
                </Heading>
                <Text color={"gray.500"}>
                    Discover real-time weather updates and forecasts for cities
                    worldwide. Simply search for a location and unlock a wealth
                    of accurate weather data, empowering you to plan your
                    activities with confidence.
                </Text>
            </Box>
        </Flex>
    );
}
