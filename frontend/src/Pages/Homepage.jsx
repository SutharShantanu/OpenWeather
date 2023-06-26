import {
    Container,
    SimpleGrid,
    Image,
    Flex,
    Heading,
    Text,
    Stack,
    StackDivider,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    TiWeatherStormy,
    TiWeatherWindy,
    TiWeatherCloudy,
} from "react-icons/ti";

export const Feature = ({ text, icon, iconBg }) => {
    return (
        <Stack direction={"row"} align={"center"}>
            <Flex
                w={8}
                h={8}
                align={"center"}
                justify={"center"}
                rounded={"full"}
                bg={iconBg}>
                {icon}
            </Flex>
            <Text fontWeight={600}>{text}</Text>
        </Stack>
    );
};

export default function Homepage() {
    return (
        <Container
            maxW={"5xl"}
            py={12}
            paddingTop={0}
            marginTop={{ base: "10px", md: "50px" }}
            marginBottom={{ base: "50px", md: "0px" }}
        >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <Stack spacing={4}>
                    <Text
                        textTransform={"uppercase"}
                        color={"blue.400"}
                        fontWeight={600}
                        fontSize={"sm"}
                        bg={useColorModeValue("blue.50", "blue.900")}
                        p={2}
                        alignSelf={"flex-start"}
                        rounded={"md"}>
                        Get know about us
                    </Text>
                    <Heading>
                        OpenWeather: Unleash the Power of Forecasting
                    </Heading>
                    <Text color={"gray.500"} fontSize={"md"}>
                        Our innovative platform empowers you with accurate,
                        real-time weather data and advanced analytics, enabling
                        you to make informed decisions and stay one step ahead
                        of the elements.
                    </Text>
                    <Stack
                        spacing={4}
                        divider={
                            <StackDivider
                                borderColor={useColorModeValue(
                                    "gray.100",
                                    "gray.700"
                                )}
                            />
                        }>
                        <Feature
                            icon={
                                <Icon
                                    as={TiWeatherCloudy}
                                    color={"yellow.500"}
                                    w={5}
                                    h={5}
                                />
                            }
                            iconBg={useColorModeValue(
                                "yellow.100",
                                "yellow.900"
                            )}
                            text={"Cloudy"}
                        />
                        <Feature
                            icon={
                                <Icon
                                    as={TiWeatherWindy}
                                    color={"green.500"}
                                    w={5}
                                    h={5}
                                />
                            }
                            iconBg={useColorModeValue("green.100", "green.900")}
                            text={"Windy"}
                        />
                        <Feature
                            icon={
                                <Icon
                                    as={TiWeatherStormy}
                                    color={"purple.500"}
                                    w={5}
                                    h={5}
                                />
                            }
                            iconBg={useColorModeValue(
                                "purple.100",
                                "purple.900"
                            )}
                            text={"Stormy"}
                        />
                    </Stack>
                </Stack>
                <Flex>
                    <Image
                        rounded={"md"}
                        alt={"feature image"}
                        src={
                            "https://cdn-icons-png.flaticon.com/512/7155/7155899.png"
                        }
                        objectFit={"cover"}
                    />
                </Flex>
            </SimpleGrid>
        </Container>
    );
}
