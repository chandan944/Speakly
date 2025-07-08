import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton, Image, Link, Stack, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import logo from "../../../assets/apple-touch-icon.png"
export function AuthenticationLayout() {
  // 🌗 Handles color mode styles
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
 const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box minH="100vh" bg={bg} borderBottom="1px solid" color={textColor}>
      {/* 🔝 Header */}
      <Flex as="header" align="center" justify="space-between" py={4} px={6}>
        <Link href="/">
          <Image src={logo} alt="Logo" height="40px" />
        </Link>
          <IconButton
            aria-label="Toggle theme"
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
          />
      </Flex>

      {/* 🔄 Main content */}
      <Flex as="main" direction="column" align="center" px={4}>
        <Box width="100%" maxW="md">
          <Outlet />
        </Box>
      </Flex>

      {/* 🔚 Footer */}
      <Box as="footer" mt={16} py={8}  borderColor="gray.300">
        <Stack spacing={4} align="center" fontSize="sm">
          <Flex align="center" gap={2}>
            <Image src={logo}  height="20px" />
            <Text>© 2024 Speakly</Text>
          </Flex>
          <Flex wrap="wrap" justify="center" gap={3}>
            {[
              "Accessibility",
              "User Agreement",
              "Privacy Policy",
              "Cookie Policy",
              "Copyright Policy",
              "Brand Policy",
              "Guest Controls",
              "Community Guidelines",
              "Language",
            ].map((item) => (
              <Link key={item} href="#" _hover={{ textDecoration: "underline" }}>
                {item}
              </Link>
            ))}
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}
