import {
    Box,
    Flex,
    Heading,
    Text,
    Stack,
    Container,
    Icon,
    useColorModeValue,
    TableContainer,
    Table,
    TableCaption,
    Thead,
    Tr,
    Th,
    Tfoot,
    Tbody,
    Td,
    Badge,
} from "@chakra-ui/react";
import { WiHumidity, WiThermometer, WiStrongWind } from "react-icons/wi";

const Testimonial = ({ children }) => {
    return (
        <Box width={{ base: "80%", md: "30%" }} m={"auto"}>
            {children}
        </Box>
    );
};

const TestimonialContent = ({ children }) => {
    return (
        <Stack
            bg={useColorModeValue("white", "gray.800")}
            boxShadow="rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px"
            p={8}
            minH={"30vh"}
            rounded={"xl"}
            align={"center"}
            pos={"relative"}
            _after={{
                content: `""`,
                w: 0,
                h: 0,
                borderLeft: "solid transparent",
                borderLeftWidth: 16,
                borderRight: "solid transparent",
                borderRightWidth: 16,
                borderTop: "solid",
                borderTopWidth: 16,
                borderTopColor: useColorModeValue("white", "gray.800"),
                pos: "absolute",
                top: "-16px",
                left: "50%",
                transform: "translateX(-50%) rotate(-180deg)",
            }}>
            {children}
        </Stack>
    );
};

const TestimonialHeading = ({ children }) => {
    return (
        <Heading as={"h3"} fontSize={"xl"}>
            {children}
        </Heading>
    );
};

const TestimonialText = ({ children }) => {
    return (
        <Text
            textAlign={"center"}
            color={useColorModeValue("gray.600", "gray.400")}
            fontSize={"sm"}>
            {children}
        </Text>
    );
};

const TestimonialAvatar = ({ icon, name, title }) => {
    return (
        <Flex align={"center"} mb={8} direction={"column"}>
            <Icon as={icon} boxSize={8} color="gray.600" mb={2} />
            <Stack spacing={-1} align={"center"}>
                <Text color={"#323234"} fontSize={"xl"} fontWeight={600}>
                    {name}
                </Text>
                <Text
                    fontSize={"sm"}
                    color={useColorModeValue("gray.600", "gray.400")}>
                    {title}
                </Text>
            </Stack>
        </Flex>
    );
};

export default function Result({ location, ...data }) {
    let {
        cloud_pct,
        temp,
        feels_like,
        humidity,
        min_temp,
        max_temp,
        wind_speed,
        wind_degrees,
        sunrise,
        sunset,
    } = data;

    var capitalizedLocation = "";

    if (location) {
        capitalizedLocation =
            location.charAt(0).toUpperCase() + location.slice(1);
    }

    const date1 = new Date(sunrise * 1000);
    const sunriseTime = date1.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });
    console.log(sunriseTime);

    const date2 = new Date(sunset * 1000);
    const sunsetTime = date2.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    return (
        <Box bg={useColorModeValue("white", "gray.700")} mb={8}>
            <Container maxW={"7xl"} py={16} as={Stack} spacing={12}>
                <Stack spacing={0} align={"center"}>
                    <Heading
                        color={"#323234"}
                        as={"h1"}
                        size={{ base: "xl", md: "4xl" }}>
                        Weather for {capitalizedLocation}
                    </Heading>
                    <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        color={"gray.500"}>
                        The weather you can trust, always
                    </Text>
                </Stack>
                <Stack
                    direction={{ base: "column", md: "row" }}
                    spacing={{ base: 10, md: 4, lg: 10 }}>
                    <Testimonial>
                        <TestimonialAvatar
                            icon={WiHumidity}
                            name={"HUMIDITY INFO"}
                        />

                        <TestimonialContent>
                            <TestimonialHeading></TestimonialHeading>
                            <TestimonialText>
                                <Text fontSize="3xl">{humidity}%</Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Wind Degree {wind_degrees}°
                                </Text>
                                <Text fontSize="md" color={"gray.500"}></Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Cloud Coverage {cloud_pct}%
                                </Text>
                            </TestimonialText>
                        </TestimonialContent>
                    </Testimonial>
                    <Testimonial>
                        <TestimonialAvatar
                            icon={WiThermometer}
                            name={"TEMPERATURE"}
                        />

                        <TestimonialContent>
                            <TestimonialHeading></TestimonialHeading>
                            <TestimonialText>
                                <Text fontSize="3xl">{temp}°C</Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Feels Like {feels_like}°C
                                </Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Min. Temprature {min_temp}°C
                                </Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Max. Temprature {max_temp}°C
                                </Text>
                            </TestimonialText>
                        </TestimonialContent>
                    </Testimonial>
                    <Testimonial>
                        <TestimonialAvatar
                            icon={WiStrongWind}
                            name={"WIND INFO"}
                        />
                        <TestimonialContent>
                            <TestimonialHeading></TestimonialHeading>
                            <TestimonialText>
                                <Text fontSize="3xl">{wind_speed}km</Text>

                                <Text fontSize="md" color={"gray.500"}>
                                    Sunrise Time {sunriseTime}
                                </Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Sunset Time {sunsetTime}
                                </Text>
                            </TestimonialText>
                        </TestimonialContent>
                    </Testimonial>
                </Stack>
                <Heading
                    color={"#323234"}
                    as={"h5"}
                    size={{ base: "md", md: "xl" }}>
                    Weather stats for top Cities
                </Heading>
                <TableContainer
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="gray.200">
                    <Table variant="striped" colorScheme="gray">
                        <TableCaption>
                            <Badge
                                variant="subtle"
                                fontSize="sm"
                                rounded={"lg"}
                                fontWeight={100}
                                colorScheme="purple">
                                Updated {new Date().toLocaleString()}
                            </Badge>
                        </TableCaption>

                        <Thead>
                            <Tr>
                                <Th>City</Th>
                                <Th>Temperature</Th>
                                <Th>Sunrise</Th>
                                <Th>Sunset</Th>
                                <Th>Humidity</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>inches</Td>
                                <Td>millimetres (mm)</Td>
                                <Td>milli (mm)</Td>
                                <Td>metres (mm)</Td>
                                <Td>25.4</Td>
                            </Tr>
                        </Tbody>
                        {/* <Tfoot>

                            <Text fontSize={"sm"}></Text>
                        </Tfoot> */}
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}
