import { useState, useEffect } from "react";
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
    Skeleton,
    Image,
} from "@chakra-ui/react";
import {
    WiDaySunny,
    WiCloud,
    WiRain,
    WiSnow,
    WiHumidity,
    WiThermometer,
    WiStrongWind,
} from "react-icons/wi";

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
            <Icon as={icon} boxSize={8} color="gray.400" mb={2} />
            <Stack spacing={-1} align={"center"}>
                <Text fontSize={"xl"} fontWeight={600}>
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

const TimeString = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const timeString = date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    return timeString;
};

function getWeatherIconCode(weatherId) {
    switch (weatherId) {
        case 200:
        case 201:
        case 202:
        case 210:
        case 211:
        case 212:
        case 221:
        case 230:
        case 231:
        case 232:
            return "11d"; // Thunderstorm

        case 300:
        case 301:
        case 302:
        case 310:
        case 311:
        case 312:
        case 313:
        case 314:
        case 321:
            return "09d"; // Drizzle

        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 520:
        case 521:
        case 522:
        case 531:
            return "10d"; // Rain

        case 600:
        case 601:
        case 602:
        case 611:
        case 612:
        case 613:
        case 615:
        case 616:
        case 620:
        case 621:
        case 622:
            return "13d"; // Snow

        case 701:
        case 711:
        case 721:
        case 731:
        case 741:
        case 751:
        case 761:
        case 762:
        case 771:
        case 781:
            return "50d"; // Atmosphere

        case 800:
            return "01d"; // Clear

        case 801:
            return "02d"; // Few clouds

        case 802:
            return "03d"; // Scattered clouds

        case 803:
        case 804:
            return "04d"; // Broken/overcast clouds

        default:
            return ""; // Unknown condition, return an empty string or a default icon
    }
}

export default function Result({ location, ...data }) {
    const [isLoading, setIsLoading] = useState(true);

    let {
        coord,
        weather,
        main,
        visibility,
        wind,
        clouds,
        dt,
        sys,
        timezone,
        name,
    } = data;

    var capitalizedLocation = "";

    if (location) {
        capitalizedLocation =
            location.charAt(0).toUpperCase() + location.slice(1);
    }

    const sunriseTime = TimeString(sys.sunrise);
    const sunsetTime = TimeString(sys.sunset);
    dt = TimeString(dt);

    const weatherIconCode = getWeatherIconCode(weather[0].id);
    const weatherIconURL = `https://openweathermap.org/img/wn/${weatherIconCode}.png`;

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, [location]);

    return (
        <Box bg={useColorModeValue("white", "gray.700")} mb={8}>
            <Container maxW={"7xl"} py={16} as={Stack} spacing={12}>
                <Stack spacing={0} align={"center"}>
                    <Heading as={"h1"} size={{ base: "xl", md: "4xl" }}>
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
                            <TestimonialHeading>Weather</TestimonialHeading>
                            <TestimonialText>
                                <Text fontSize="3xl">{weather[0].main}</Text>
                                <Image
                                    src={weatherIconURL}
                                    alt="Weather Icon"
                                />

                                <Text fontSize="md" color={"gray.500"}>
                                    Condition {weather[0].description}
                                </Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    ID {weather[0].id}
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
                            <TestimonialHeading>Temperature</TestimonialHeading>
                            <TestimonialText>
                                <Text fontSize="3xl">{main.temp}°C</Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Feels Like {main.feels_like}°C
                                </Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Min. Temperature {main.temp_min}°C
                                </Text>
                                <Text fontSize="md" color={"gray.500"}>
                                    Max. Temperature {main.temp_max}°C
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
                            <TestimonialHeading>Humidity</TestimonialHeading>
                            <TestimonialText>
                                <Text fontSize="3xl">{clouds.all}%</Text>
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
                {isLoading ? (
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={{ base: 10, md: 4, lg: 10 }}>
                        <Skeleton width={{ base: "80%", md: "30%" }} m={"auto"}>
                            <Testimonial>
                                <TestimonialAvatar
                                    icon={WiHumidity}
                                    name={"HUMIDITY INFO"}
                                />
                                <TestimonialContent>
                                    <TestimonialHeading></TestimonialHeading>
                                    <TestimonialText>
                                        <Text fontSize="3xl">
                                            {WiHumidity}%
                                        </Text>
                                        <Text fontSize="md" color={"gray.500"}>
                                            Wind Degree {}°
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            color={"gray.500"}></Text>
                                        <Text fontSize="md" color={"gray.500"}>
                                            Cloud Coverage {}%
                                        </Text>
                                    </TestimonialText>
                                </TestimonialContent>
                            </Testimonial>
                        </Skeleton>
                        <Skeleton width={{ base: "80%", md: "30%" }} m={"auto"}>
                            <Testimonial>
                                <TestimonialAvatar
                                    icon={WiThermometer}
                                    name={"TEMPERATURE"}
                                />
                                <TestimonialContent>
                                    <TestimonialHeading></TestimonialHeading>
                                    <TestimonialText>
                                        <Text fontSize="3xl">{}°C</Text>
                                        <Text fontSize="md" color={"gray.500"}>
                                            Feels Like {}°C
                                        </Text>
                                        <Text fontSize="md" color={"gray.500"}>
                                            Min. Temprature {}°C
                                        </Text>
                                        <Text fontSize="md" color={"gray.500"}>
                                            Max. Temprature {}°C
                                        </Text>
                                    </TestimonialText>
                                </TestimonialContent>
                            </Testimonial>
                        </Skeleton>
                        <Skeleton width={{ base: "80%", md: "30%" }} m={"auto"}>
                            <Testimonial>
                                <TestimonialAvatar
                                    icon={WiStrongWind}
                                    name={"WIND INFO"}
                                />
                                <TestimonialContent>
                                    <TestimonialHeading></TestimonialHeading>
                                    <TestimonialText>
                                        <Text fontSize="3xl">{}km</Text>
                                        <Text fontSize="md" color={"gray.500"}>
                                            Sunrise Time {sunriseTime}
                                        </Text>
                                        <Text fontSize="md" color={"gray.500"}>
                                            Sunset Time {sunsetTime}
                                        </Text>
                                    </TestimonialText>
                                </TestimonialContent>
                            </Testimonial>
                        </Skeleton>
                    </Stack>
                ) : (
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={{ base: 10, md: 4, lg: 10 }}>
                        <Testimonial>
                            <TestimonialAvatar
                                icon={WiHumidity}
                                name={"HUMIDITY INFO"}
                            />
                            <TestimonialContent>
                                <TestimonialHeading>
                                    Wind Info
                                </TestimonialHeading>
                                <TestimonialText>
                                    <Text fontSize="3xl">{wind.speed}mt/s</Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Wind Degree {wind.deg}°
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Wind Gusts {wind.gust}mt/s
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
                                <TestimonialHeading>
                                    Temperature
                                </TestimonialHeading>
                                <TestimonialText>
                                    <Text fontSize="3xl">
                                        {(main.temp - 273.15).toFixed(2)}°C
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Feels Like
                                        {(main.feels_like - 273.15).toFixed(2)}
                                        °C
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Min. Temperature
                                        {(main.temp_min - 273.15).toFixed(2)}°C
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Max. Temperature
                                        {(main.temp_max - 273.15).toFixed(2)}°C
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
                                <TestimonialHeading>
                                    Humidity
                                </TestimonialHeading>
                                <TestimonialText>
                                    <Text fontSize="3xl">{clouds.all}%</Text>
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
                )}
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
                                Updated {dt}
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
