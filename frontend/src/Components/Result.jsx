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
    Tbody,
    Td,
    Badge,
    Image,
    SkeletonCircle,
    SkeletonText,
    Tfoot,
    Highlight,
} from "@chakra-ui/react";
import {
    WiHumidity,
    WiThermometer,
    WiStrongWind,
    WiDaySunny,
    WiSunset,
    WiSunrise,
    WiBarometer,
    WiWindDeg,
} from "react-icons/wi";
import { CiLocationOn } from "react-icons/ci";
import { TbWorldLatitude, TbWorldLongitude } from "react-icons/tb";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

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
            py={8}
            px={0}
            minH={"25vh"}
            maxH={"42vh"}
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

const TestimonialText = ({ children }) => {
    return (
        <Box
            w={"50%"}
            m={"auto"}
            textAlign={"center"}
            color={useColorModeValue("gray.600", "gray.400")}
            fontSize={"sm"}>
            {children}
        </Box>
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

function getWeatherIconCode(weatherId, isDarkMode) {
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
            return isDarkMode ? "11n" : "11d";

        case 300:
        case 301:
        case 302:
        case 310:
        case 311:
        case 312:
        case 313:
        case 314:
        case 321:
            return isDarkMode ? "09n" : "09d";

        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 520:
        case 521:
        case 522:
        case 531:
            return isDarkMode ? "10n" : "10d";

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
            return isDarkMode ? "13n" : "13d";

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
            return isDarkMode ? "50n" : "50d";

        case 800:
            return isDarkMode ? "01n" : "01d";

        case 801:
            return isDarkMode ? "02n" : "02d";

        case 802:
            return isDarkMode ? "03n" : "03d";

        case 803:
        case 804:
            return isDarkMode ? "04n" : "04d";

        default:
            return "";
    }
}

function SkeletonComponent() {
    return (
        <Box bg="white" w={{ base: "100%", md: "30%" }} m={"auto"}>
            <SkeletonCircle mb="4" size="10" m="auto" />
            <Box mt="6" padding="6" boxShadow="lg" bg="white" borderRadius="xl">
                <SkeletonText
                    mt="4"
                    noOfLines={3}
                    spacing="6"
                    skeletonHeight="8"
                />
            </Box>
        </Box>
    );
}

export default function Result({ location, data, citiesData }) {
    const [isLoading, setIsLoading] = useState(true);
    // console.log(citiesData);
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

    const sunriseTime = TimeString(sys.sunrise);
    const sunsetTime = TimeString(sys.sunset);
    dt = TimeString(dt);

    const isDarkMode = useColorModeValue(false, true);
    const weatherIconCode = getWeatherIconCode(weather[0].id, isDarkMode);
    const weatherIconURL = `https://openweathermap.org/img/wn/${weatherIconCode}.png`;

    const timezoneHours = Math.floor(Math.abs(timezone) / 3600);
    const timezoneMinutes = Math.floor((Math.abs(timezone) % 3600) / 60);
    const timezoneSign = timezone >= 0 ? "+" : "-";

    timezone = `${timezoneSign}${timezoneHours}:${timezoneMinutes} GMT`;

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, [location]);

    return (
        <Box bg={useColorModeValue("white", "gray.700")} mb={8}>
            <Container maxW={"7xl"} py={16} as={Stack} spacing={12}>
                {isLoading ? (
                    <Stack spacing={0} align={"center"}>
                        <Box bg="white" minH={"23vh"} m={"auto"} w={"100%"}>
                            <SkeletonText
                                mt="2"
                                noOfLines={1}
                                spacing="4"
                                w={{ base: "90%", md: "45%" }}
                                m="auto"
                                skeletonHeight="16"
                            />
                            <SkeletonText
                                w={{ base: "75%", md: "30%" }}
                                m="auto"
                                mt="4"
                                noOfLines={1}
                                spacing="4"
                                skeletonHeight="4"
                            />
                        </Box>
                    </Stack>
                ) : (
                    <Stack spacing={0} align={"center"}>
                        <Heading as={"h1"} size={{ base: "xl", md: "4xl" }}>
                            Weather for&nbsp;
                            <Highlight
                                query={name}
                                styles={{
                                    px: "2",
                                    py: "1",
                                    rounded: "2xl",
                                    bg: "orange.200",
                                }}>
                                {name}
                            </Highlight>
                        </Heading>
                        <Text
                            fontSize={{ base: "xl", md: "2xl" }}
                            color={"gray.500"}>
                            The weather you can trust, always
                        </Text>
                    </Stack>
                )}

                {isLoading ? (
                    <Stack
                        w={"100%"}
                        direction={{ base: "column", md: "row" }}
                        spacing={{ base: 10, md: 4, lg: 10 }}>
                        <SkeletonComponent />
                        <SkeletonComponent />
                        <SkeletonComponent />
                    </Stack>
                ) : (
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={{ base: 10, md: 4, lg: 10 }}>
                        <Testimonial>
                            <TestimonialAvatar
                                icon={WiDaySunny}
                                name={"WEATHER"}
                            />
                            <TestimonialContent>
                                <TestimonialText>
                                    <Flex
                                        alignItems="center"
                                        direction={{
                                            base: "column",
                                            md: "row",
                                        }}>
                                        <Text fontSize="3xl" mr={4} w="60%">
                                            {weather[0].main}
                                        </Text>
                                        <Image
                                            src={weatherIconURL}
                                            w="40%"
                                            alt="Weather Icon"
                                        />
                                    </Flex>
                                    <Text fontSize="md" color="gray.500">
                                        Condition: {weather[0].description}
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Id {weather[0].id}
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
                                <TestimonialText>
                                    <Text fontSize="3xl">
                                        {(main.temp - 273.15).toFixed(2)}°C
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Feels Like&nbsp;
                                        {(main.feels_like - 273.15).toFixed(2)}
                                        °C
                                    </Text>
                                    <Flex alignItems="center" w="100%" m="auto">
                                        <Text
                                            fontSize="md"
                                            color={"gray.500"}
                                            w="50%">
                                            Min.{" "}
                                            <ChevronDownIcon color="orange" />
                                            &nbsp;
                                            {(main.temp_min - 273.15).toFixed(
                                                2
                                            )}
                                            °C
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            color={"gray.500"}
                                            w="50%">
                                            Max. <ChevronUpIcon color="red" />
                                            &nbsp;
                                            {(main.temp_max - 273.15).toFixed(
                                                2
                                            )}
                                            °C
                                        </Text>
                                    </Flex>
                                </TestimonialText>
                            </TestimonialContent>
                        </Testimonial>
                        <Testimonial>
                            <TestimonialAvatar
                                icon={CiLocationOn}
                                name={"LOCATION"}
                            />
                            <TestimonialContent>
                                <TestimonialText>
                                    <Text fontSize="3xl">{sys.country}</Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Time Zone {timezone}
                                    </Text>
                                    <Flex alignItems="center" m="auto" w="100%">
                                        <Text
                                            fontSize="md"
                                            color={"gray.500"}
                                            w="50%">
                                            <TbWorldLongitude
                                                style={{
                                                    margin: "auto",
                                                    fontSize: "25px",
                                                }}
                                            />
                                            {coord.lon}
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            color={"gray.500"}
                                            w="50%">
                                            <TbWorldLatitude
                                                style={{
                                                    margin: "auto",
                                                    fontSize: "25px",
                                                }}
                                            />
                                            {coord.lat}
                                        </Text>
                                    </Flex>
                                </TestimonialText>
                            </TestimonialContent>
                        </Testimonial>
                    </Stack>
                )}
                {isLoading ? (
                    <Stack
                        w={"100%"}
                        direction={{ base: "column", md: "row" }}
                        spacing={{ base: 10, md: 4, lg: 10 }}>
                        <SkeletonComponent />
                        <SkeletonComponent />
                        <SkeletonComponent />
                    </Stack>
                ) : (
                    <Stack
                        direction={{ base: "column", md: "row" }}
                        spacing={{ base: 10, md: 4, lg: 10 }}>
                        <Testimonial>
                            <TestimonialAvatar
                                name={"WIND INFO"}
                                icon={WiStrongWind}
                            />
                            <TestimonialContent>
                                <TestimonialText>
                                    <Text fontSize="3xl">
                                        {wind.speed}&nbsp;mt/s
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Degree {wind.deg}°
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Gusts {wind.gust} mt/s
                                    </Text>
                                </TestimonialText>
                            </TestimonialContent>
                        </Testimonial>
                        <Testimonial>
                            <TestimonialAvatar
                                icon={WiBarometer}
                                name={"Sea levels"}
                            />
                            <TestimonialContent>
                                <TestimonialText>
                                    <Text fontSize="3xl">
                                        {main.pressure}&nbsp;hPa
                                    </Text>
                                    <Text fontSize="md" color="gray.500">
                                        Level {main.sea_level} hPa
                                    </Text>
                                    <Text fontSize="md" color="gray.500">
                                        Grnd {main.grnd_level} hPa
                                    </Text>
                                </TestimonialText>
                            </TestimonialContent>
                        </Testimonial>
                        <Testimonial>
                            <TestimonialAvatar
                                icon={WiHumidity}
                                name={"HUMIDITY INFO"}
                            />
                            <TestimonialContent>
                                <TestimonialText>
                                    <Text fontSize="3xl">
                                        {main.humidity}&nbsp;%
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Clouds&nbsp;{clouds.all}%
                                    </Text>
                                    <Text fontSize="md" color={"gray.500"}>
                                        Visiblity&nbsp;{visibility}m
                                    </Text>
                                    <Flex alignItems="center" m="auto" w="100%">
                                        <Text
                                            fontSize="md"
                                            color={"gray.500"}
                                            w="50%">
                                            <WiSunrise
                                                style={{
                                                    margin: "auto",
                                                    fontSize: "25px",
                                                }}
                                            />
                                            {sunriseTime}
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            color={"gray.500"}
                                            w="50%">
                                            <WiSunset
                                                style={{
                                                    margin: "auto",
                                                    fontSize: "25px",
                                                }}
                                            />
                                            {sunsetTime}
                                        </Text>
                                    </Flex>
                                </TestimonialText>
                            </TestimonialContent>
                        </Testimonial>
                    </Stack>
                )}
                {isLoading ? (
                    <TableContainer
                        borderRadius="xl"
                        borderWidth="1px"
                        mb={6}
                        p={4}
                        borderColor="gray.200">
                        <Box bg="white" minH={"23vh"} m={"auto"} w={"100%"}>
                            <SkeletonText
                                mt="2"
                                noOfLines={1}
                                spacing="4"
                                w={{ base: "90%", md: "100%" }}
                                m="auto"
                                skeletonHeight="12"
                            />
                            <SkeletonText
                                w={{ base: "75%", md: "100%" }}
                                m="auto"
                                mt="4"
                                noOfLines={5}
                                spacing="4"
                                skeletonHeight="6"
                            />
                            <SkeletonText
                                w={{ base: "30%", md: "10%" }}
                                m="auto"
                                mt="2"
                                noOfLines={1}
                                spacing="4"
                                skeletonHeight="4"
                            />
                        </Box>
                    </TableContainer>
                ) : (
                    <TableContainer
                        borderRadius="xl"
                        borderWidth="1px"
                        mb={6}
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
                                    <Th>Weather</Th>
                                    <Th>Clouds</Th>
                                    <Th>Humidity</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {citiesData
                                    ? citiesData.map((ele) => {
                                          return (
                                              <Tr
                                                  style={
                                                      {
                                                      }
                                                  }
                                                  _hover={{
                                                      boxShadow:
                                                          "0 2px 4px rgba(0, 0, 0, 0.2)",
                                                      zIndex: 1,
                                                      borderRadius: "xl",
                                                      transition:
                                                          "all 0.3s ease-in-out",
                                                  }}>
                                                  <Td>{ele.name}</Td>
                                                  <Td>
                                                      {(
                                                          ele.main.temp - 273.15
                                                      ).toFixed(2)}
                                                      °C
                                                  </Td>
                                                  <Td>{ele.weather[0].main}</Td>
                                                  <Td>{ele.clouds.all}%</Td>
                                                  <Td>{ele.main.humidity}%</Td>
                                              </Tr>
                                          );
                                      })
                                    : null}
                            </Tbody>
                            <Tfoot>
                                <Text fontSize={"sm"}></Text>
                            </Tfoot>
                        </Table>
                    </TableContainer>
                )}
            </Container>
        </Box>
    );
}
