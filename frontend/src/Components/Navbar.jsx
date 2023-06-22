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
} from "@chakra-ui/react";
import {
    SearchIcon,
    MoonIcon,
    SunIcon,
    HamburgerIcon,
    CloseIcon,
} from "@chakra-ui/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LightLogo from "../Uitlites/OpenWeather-Logo-Light.png";
import DarkLogo from "../Uitlites/OpenWeather-Logo-Dark.png";

export default function Navbar() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState("");
    // const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        // navigate(`/search?query=${searchQuery}`);
        setSearchQuery("");
    };

    const handleChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <Box bg={useColorModeValue("gray.100", "gray.900")} px={8}>
            <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
                <IconButton
                    size={"md"}
                    icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                    aria-label={"Open Menu"}
                    display={{ md: "none" }}
                    onClick={isOpen ? onClose : onOpen}
                />
                <HStack width={"30%"} spacing={8} alignItems={"center"}>
                    <Image
                        style={{
                            width: "30%",
                            margin: "0px",
                        }}
                        src={colorMode === "light" ? LightLogo : DarkLogo}
                        alt="logo"
                    />

                    <HStack
                        as={"nav"}
                        spacing={2}
                        display={{ base: "none", md: "flex" }}>
                        <Link
                            px={2}
                            py={1}
                            rounded={"md"}
                            _hover={{
                                textDecoration: "none",
                                bg: useColorModeValue("gray.200", "gray.700"),
                            }}
                            href="">
                            Search
                        </Link>
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
                            value={searchQuery}
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
                </HStack>
                <HStack
                    width={"30%"}
                    alignItems={"end"}
                    justifyContent={"flex-end"}>
                    <Button
                        onClick={toggleColorMode}
                        p={0}
                        borderRadius={"full"}>
                        {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                    </Button>
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
                                value={searchQuery}
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
