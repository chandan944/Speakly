// Navbar.tsx
// import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  HStack,
  Button,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  useColorMode,
  Image,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { HamburgerIcon } from "@chakra-ui/icons";
import { FaHome, FaEnvelope, FaBell, FaUsers } from "react-icons/fa";
import { Search } from "./components/search/Search";
import { MyProfile } from "./components/myProfile/MyProfile";
import logo from "../../assets/apple-touch-icon.png";

import { useCount } from "../Notify/CountContext";

const Navbar = () => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const location = useLocation();

  // 🎯 Notification count from context
  const { count: notificationCount , RecievedConnection ,messageCount} = useCount();

  // 🚀 Connection count local state
  // const [, setConnectionCount] = useState(0);
  // const [isLoading, setIsLoading] = useState(false);
  // const connectionCountRef = useRef(0);

  // 🔥 Fetch ONLY the connection count
  // const fetchConnectionCount = useCallback(async () => {
  //   try {
  //     const newCount = getMyConnection(); // sync getter
  //     if (newCount !== connectionCountRef.current) {
  //       connectionCountRef.current = newCount;
  //       setConnectionCount(newCount);
  //       console.log("🔗 Connection count updated:", newCount);
  //     }
  //   } catch (err) {
  //     console.error("❌ Error fetching connection count:", err);
  //   }
  // }, []);

  // 🛑 Simplified fetchCounts — no self‑recursion!
  // const fetchCounts = useCallback(async () => {
  //   if (isLoading) return;
  //   setIsLoading(true);
  //   await fetchConnectionCount();
  //   setIsLoading(false);
  // }, [fetchConnectionCount, isLoading]);

  // ▶️ Initial & on-route-change fetch
  // useEffect(() => {
  //   fetchCounts();
  // }, [fetchCounts]);
  // useEffect(() => {
  //   fetchCounts();
  // }, [location.pathname, fetchCounts]);

  // // 🔄 Poll every 30s when visible
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!document.hidden && !isLoading) fetchCounts();
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [fetchCounts, isLoading]);

  // 📦 Sidebar links + badges
  console.log("from navebar", messageCount);
  const navItems = [
    { icon: <FaHome />, label: "Home", link: "/", showCount: false, count: 0 },
    {
      icon: <FaEnvelope />,
      label: "Messages",
      link: "/messaging",
      showCount: true,
      count: messageCount, // Use messageCount from context
    },
    {
      icon: <FaUsers />,
      label: "Learners",
      link: "/network",
      showCount: true,
      count: RecievedConnection,
    },
    {
      icon: <FaBell />,
      label: "Notification",
      link: "/notification",
      showCount: true,
      count: notificationCount,
    },
  ];

  // 🛠 Badge component
  const CountBadge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
      <Box
        position="absolute"
        top="-3px"
        right="-3px"
        w="20px"
        h="21px"
        bg="green.300"
        color="white"
        fontSize="xs"
        fontWeight="bold"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
        boxShadow="md"
      >
        {count > 99 ? "99+" : count}
      </Box>
    );
  };

  return (
    <>
      <Flex
        as="nav"
        px={4}
        py={2}
        align="center"
        justify="space-between"
        boxShadow="md"
        borderBottom="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        backdropFilter="blur(8px)"
        position="sticky"
        top="0"
        zIndex="999"
      >
        <Flex as={RouterLink} to="/" align="center" gap={2}>
          <Image src={logo} boxSize="36px" borderRadius="full" alt="Speakly" />
          <Heading
            size="md"
            fontFamily="'Pacifico', cursive"
            
            fontWeight="bold"
            display={{ base: "none", sm: "block" }}
          >
            Talksy
          </Heading>
        </Flex>

        <Box flex="1" maxW="20rem" mx={4}>
          <Search />
        </Box>

        <HStack spacing={6} display={{ base: "none", md: "flex" }}>
          {navItems.map((item, i) => (
            <Box key={i} position="relative">
              {item.showCount && <CountBadge count={item.count} />}
              <Button
                as={RouterLink}
                to={item.link}
                leftIcon={item.icon}
                variant="ghost"
                colorScheme="gray"
                _hover={{ color: "teal.500" }}
              >
                {item.label}
              </Button>
            </Box>
          ))}
        </HStack>

        <Flex align="center">
          <Box display={{ base: "block", md: "none" }}>
            <IconButton
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              aria-label="Menu"
            />
          </Box>
          <MyProfile />
        </Flex>
      </Flex>

      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          mt="4.6rem"
          mr={1}
          borderRadius={5}
          maxW="10rem"
          maxH={"20rem"}
        >
          <DrawerCloseButton />
          <DrawerBody mt={12}>
            <VStack align="start" spacing={4}>
              {navItems.map((item, i) => (
                <Box key={i} position="relative" w="full">
                  {item.showCount && <CountBadge count={item.count} />}
                  <Button
                    as={RouterLink}
                    to={item.link}
                    leftIcon={item.icon}
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={onClose}
                    _hover={{ color: "teal.500" }}
                  >
                    {item.label}
                  </Button>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;
