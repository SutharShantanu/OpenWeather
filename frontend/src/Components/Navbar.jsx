import {
    Box,
    Flex,
    IconButton,
    Button,
    useDisclosure,
    useColorModeValue,
    Stack,
    useColorMode,
    HStack,
    Link,
    InputGroup,
    Input,
    InputRightElement,
    Image,
    Tooltip,
    useToast,
} from "@chakra-ui/react";
import {
    SearchIcon,
    MoonIcon,
    SunIcon,
    HamburgerIcon,
    CloseIcon,
} from "@chakra-ui/icons";
import { useState } from "react";
import { useNavigate, Link as Reactlink } from "react-router-dom";
import LightLogo from "../Uitlites/OpenWeather-Logo-Light.png";
import DarkLogo from "../Uitlites/OpenWeather-Logo-Dark.png";

export default function Navbar() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const handleChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        let lower = search;
        lower = lower.toLowerCase();
        toast({
            title: "Searching weather results for " + search + " ...",
            description: "",
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "top",
        });
        navigate("/weather/search?location=" + lower);
    };

    return (
        <Box
            zIndex={1000}
            position={"sticky"}
            top={0}
            bg={useColorModeValue("gray.100", "gray.900")}
            px={8}
            maxW="100%"
            overflowX="hidden">
            <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
                <IconButton
                    size={"md"}
                    icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                    aria-label={"Open Menu"}
                    display={{ md: "none" }}
                    onClick={isOpen ? onClose : onOpen}
                />
                <HStack width={"30%"} spacing={8} alignItems={"center"}>
                    <HStack spacing={2} width={"40%"}>
                        <Reactlink to="/">
                            <Image
                                style={{
                                    width: "80%",
                                    margin: "0px",
                                }}
                                src={
                                    colorMode === "light" ? LightLogo : DarkLogo
                                }
                                alt="logo"
                            />
                        </Reactlink>
                    </HStack>

                    <HStack
                        as={"nav"}
                        spacing={2}
                        width={"50%"}
                        display={{ base: "none", md: "flex" }}>
                        <Tooltip
                            hasArrow
                            label="Go to search page"
                            bg="gray.300"
                            color="black">
                            <Reactlink to="/weather/search">
                                <Link
                                    px={2}
                                    py={1}
                                    rounded={"md"}
                                    _hover={{
                                        textDecoration: "none",
                                        bg: useColorModeValue(
                                            "gray.200",
                                            "gray.700"
                                        ),
                                    }}
                                    href="">
                                    Search
                                </Link>
                            </Reactlink>
                        </Tooltip>
                    </HStack>
                </HStack>
                <HStack
                    as={"nav"}
                    spacing={2}
                    display={{ base: "none", md: "flex" }}
                    width={"30%"}>
                    <InputGroup w={"100%"}>
                        <Input
                            type="search"
                            placeholder="Search Weather here ☁️"
                            style={{
                                border: `1px solid ${useColorModeValue(
                                    "gray.500",
                                    "gray.700"
                                )}`,
                                transition: "border-color 0.2s",
                            }}
                            _hover={{
                                textDecoration: "none",
                                bg: useColorModeValue("gray.200", "gray.700"),
                            }}
                            _focusVisible={{
                                outline: "none",
                                border: `1px solid ${useColorModeValue(
                                    "gray.500",
                                    "gray.700"
                                )}`,
                                bg: useColorModeValue("gray.200", "gray.700"),
                            }}
                            value={search}
                            onChange={handleChange}
                        />
                        <InputRightElement>
                            <Tooltip
                                hasArrow
                                label="Search Now"
                                bg="gray.300"
                                color="black">
                                <Button
                                    style={{ backgroundColor: "transparent" }}
                                    onClick={handleSearch}>
                                    <SearchIcon />
                                </Button>
                            </Tooltip>
                        </InputRightElement>
                    </InputGroup>
                </HStack>
                <HStack
                    width={"30%"}
                    alignItems={"end"}
                    justifyContent={"flex-end"}>
                    <Tooltip
                        hasArrow
                        label="Switch color mode"
                        bg="gray.300"
                        color="black">
                        <Button
                            onClick={toggleColorMode}
                            p={0}
                            borderRadius={"full"}>
                            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                        </Button>
                    </Tooltip>
                </HStack>
            </Flex>

            {isOpen ? (
                <Box pb={4} display={{ md: "none" }}>
                    <Stack as={"nav"} spacing={4}>
                        <Link
                            px={2}
                            py={1}
                            rounded={"md"}
                            _hover={{
                                textDecoration: "none",
                                // bg: useColorModeValue("gray.200", "gray.700"),
                            }}
                            href="">
                            Search
                        </Link>
                        <InputGroup w={"85%"} m={"auto"}>
                            <Input
                                type="search"
                                placeholder="Search here anything"
                                _focusVisible={{
                                    outline: "none",
                                    backgroundColor: "#EDF2F7",
                                }}
                                value={search}
                                onChange={handleChange}
                            />
                            <InputRightElement>
                                <Button
                                    style={{ backgroundColor: "transparent" }}
                                    onClick={handleSearch}>
                                    <SearchIcon />
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Stack>
                </Box>
            ) : null}
        </Box>
    );
}
