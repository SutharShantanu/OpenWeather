import {
  Box,
  Flex,
  IconButton,
  Button,
  useDisclosure,
  Stack,
  HStack,
  Link,
  InputGroup,
  Input,
  InputRightElement,
  Image,
  Tooltip,
  useToast,
  Spinner,
  useColorMode
} from "@chakra-ui/react";
import {
  SearchIcon,
  MoonIcon,
  SunIcon,
  HamburgerIcon,
  CloseIcon
} from "@chakra-ui/icons";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link as ReactLink } from "react-router-dom";
import LightLogo from "../Uitlites/OpenWeather-Logo-Light.png";
import DarkLogo from "../Uitlites/OpenWeather-Logo-Dark.png";

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isButLoading, setIsButLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search) {
      toast({
        title: "Please enter a location to search",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    let lower = search.toLowerCase();
    setIsButLoading(true);

    setTimeout(() => {
      axios
        .get(`https://openweatherbackend.cyclic.app/weather/search/${lower}`)
        .then((res) => {
          const responseStatusCode = res.status;
          const responseMessage = res.data.message;
          setIsButLoading(false);

          if (
            responseStatusCode === 500 &&
            responseMessage === "Internal Server Error"
          ) {
            toast({
              title: "Please enter a valid city name",
              status: "warning",
              duration: 2000,
              isClosable: true,
              position: "top"
            });
            return;
          }

          toast({
            title: "Found weather for " + search + " ...",
            description: "",
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "top"
          });
          navigate("/weather/search?location=" + lower);
        })
        .catch((error) => {
          // console.error(error);
          setIsButLoading(false);
          toast({
            title: "Please enter a valid city name !",
            status: "error",
            duration: 2000,
            isClosable: true,
            position: "top"
          });
        });
    }, 2000);
  };

  const { colorMode, toggleColorMode } = useColorMode();
  const logo = colorMode === "light" ? LightLogo : DarkLogo;

  return (
    <Box
      zIndex={1000}
      position={"sticky"}
      top={0}
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
      px={8}
      maxW="100%"
      overflowX="hidden"
    >
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          width={{ base: "10%", md: "0%" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack width={"30%"} spacing={8} alignItems={"center"}>
          <HStack spacing={2} width={{ base: "100%", md: "50%" }}>
            <ReactLink to="/">
              <Image
                width={{ base: "100%", md: "80%" }}
                margin={{ base: "0px", md: "0px" }}
                src={logo}
                alt="logo"
              />
            </ReactLink>
          </HStack>

          <HStack
            as={"nav"}
            spacing={2}
            width={"50%"}
            display={{ base: "none", md: "flex" }}
          >
            <Tooltip
              hasArrow
              label="Go to search page"
              bg="gray.300"
              color="#323234"
            >
              <ReactLink to="/weather/search">
                <Link
                  px={2}
                  py={1}
                  rounded={"md"}
                  _hover={{
                    textDecoration: "none",
                    bg: colorMode === "light" ? "gray.200" : "gray.700"
                  }}
                  href=""
                >
                  Search
                </Link>
              </ReactLink>
            </Tooltip>
          </HStack>
        </HStack>
        <HStack
          as={"nav"}
          spacing={2}
          display={{ base: "none", md: "flex" }}
          width={"30%"}
        >
          <InputGroup w={"100%"}>
            <Input
              type="search"
              placeholder="Search Weather here ☁️"
              style={{
                border: `1px solid ${
                  colorMode === "light" ? "gray.500" : "gray.700"
                }`,
                // width: "90%",
                transition: "border-color 0.2s"
              }}
              _hover={{
                textDecoration: "none",
                bg: colorMode === "light" ? "gray.200" : "gray.700"
              }}
              _focusVisible={{
                outline: "none",
                border: `1px solid ${
                  colorMode === "light" ? "gray.500" : "gray.700"
                }`,
                bg: colorMode === "light" ? "gray.200" : "gray.700"
              }}
              value={search}
              onKeyPress={handleKeyPress}
              onChange={handleChange}
            />

            <InputRightElement width={"11%"}>
              <Tooltip
                hasArrow
                label="Search Now"
                bg="gray.300"
                color="#323234"
              >
                <Button
                  style={{ backgroundColor: "transparent" }}
                  onClick={handleSearch}
                >
                  {!isButLoading && <SearchIcon />}
                  {isButLoading && (
                    <Spinner
                      thickness="2px"
                      speed="0.50s"
                      emptyColor="gray.200"
                      color="#323234"
                      size="xs"
                    />
                  )}
                </Button>
              </Tooltip>
            </InputRightElement>
          </InputGroup>
        </HStack>
        <HStack
          width={{ base: "10%", md: "30%" }}
          alignItems={"end"}
          justifyContent={"flex-end"}
        >
          <Tooltip
            hasArrow
            label="Switch color mode"
            bg="gray.300"
            color="#323234"
          >
            <Button onClick={toggleColorMode} p={0} borderRadius={"full"}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      {isOpen && (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            <InputGroup>
              <Input
                type="search"
                placeholder="Search Weather here ☁️"
                style={{
                  border: `1px solid ${
                    colorMode === "light" ? "gray.500" : "gray.700"
                  }`,
                  transition: "border-color 0.2s"
                }}
                _hover={{
                  textDecoration: "none",
                  bg: colorMode === "light" ? "gray.200" : "gray.700"
                }}
                _focusVisible={{
                  outline: "none",
                  border: `1px solid ${
                    colorMode === "light" ? "gray.500" : "gray.700"
                  }`,
                  bg: colorMode === "light" ? "gray.200" : "gray.700"
                }}
                value={search}
                onKeyPress={handleKeyPress}
                onChange={handleChange}
              />

              <InputRightElement width={"7%"}>
                <Button
                  style={{
                    backgroundColor: "transparent"
                  }}
                  onClick={handleSearch}
                >
                  {!isButLoading && <SearchIcon />}
                  {isButLoading && (
                    <Spinner
                      thickness="2px"
                      speed="0.50s"
                      emptyColor="gray.200"
                      color="#323234"
                      size="xs"
                    />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
