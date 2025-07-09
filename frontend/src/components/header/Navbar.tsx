import {
  Flex,
  Heading,
  Spacer,
  IconButton,
  useColorMode,
  Image,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { MyProfile } from "./components/myProfile/MyProfile";
import logo from "../../assets/apple-touch-icon.png";
const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="nav"
      p={4}
      bg={colorMode === "light" ? "whiteAlpha.900" : "gray.900"}
      color={colorMode === "light" ? "gray.900" : "whiteAlpha.900"}
      align="center"
      boxShadow="md"
      borderBottom="1px solid"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      backdropFilter="blur(8px)"
      position="sticky"
      top="0"
      zIndex="999"
    >
      <Heading
        size="lg"
        display="flex"
        alignItems="center"
        gap={2}
        fontFamily="'Pacifico', sans-serif" // or 'Inter', 'DM Sans', etc.
        fontWeight="bold"
      >
        <Image
          src={logo}
          alt="Speakly Logo"
          boxSize="36px" // Chakra size (auto responsive)
          objectFit="contain"
          className="rounded-full" // Tailwind styling
        />
        Speakly
      </Heading>

      <Spacer />
      <IconButton
       pr={2}
        aria-label="Toggle theme"
        onClick={toggleColorMode}
        icon={colorMode === "light" ? <MoonIcon color={"black"}/> : <SunIcon color={"orange"}/>}
        variant="ghost"
      />
      <MyProfile />
    </Flex>
  );
};

export default Navbar;
